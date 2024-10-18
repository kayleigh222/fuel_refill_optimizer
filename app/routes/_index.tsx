import { useEffect, useState } from 'react';
import type { MetaFunction } from '@remix-run/node';
import GoogleMapComponent from '~/googleMapComponent';
import petrolStations, { PetrolStation } from '~/stationInfo';

// Meta function for SEO
export const meta: MetaFunction = () => {
  return [
    { title: "Petrol Price Finder" },
    { name: "description", content: "Find the most cost-efficient petrol station based on price and route." },
  ];
};


const geocodeAddress = (address: string): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK) {
        const { lat, lng } = results[0].geometry.location.toJSON();
        console.log('Geocode successful:', lat, lng);
        resolve({ lat, lng }); // Resolve the promise with the coordinates
      } else {
        reject(new Error('Geocode was not successful for the following reason: ' + status));
      }
    });
  });
};

export default function Index() {
  const [startLocation, setStartLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [fuelEfficiency, setFuelEfficiency] = useState(7); // Default to 7 L/100km
  const [amountToBuy, setAmountToBuy] = useState(40); // Default to 40 liters
  const [amountInTank, setAmountInTank] = useState(10); // Default to 10 liters
  const [startLocationCoords, setStartLocationCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number, lng: number } | null>(null);
  const [bestStation, setBestStation] = useState<PetrolStation | null>(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);  // Add a loading state
  const [timeCost, setTimeCost] = useState(0); // Default to $0
  const [isInfoPopupOpen, setIsInfoPopupOpen] = useState(false); // Modal visibility state

  // Function to toggle the popup
  const toggleInfoPopup = () => setIsInfoPopupOpen(!isInfoPopupOpen);

   // Function to format time in hours to hours:minutes
   function formatTime(totalHours) {
    const hours = Math.floor(totalHours); // Get whole hours
    const minutes = Math.round((totalHours - hours) * 60); // Get the remaining minutes
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`; // Format as hours:minutes
  }

  useEffect(() => {
    // Get the user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        // Reverse geocode to get a human-readable address (optional)
        const address = `${latitude}, ${longitude}`; // You can use an address instead if you have a geocoding function
        setStartLocation(address);
        setStartLocationCoords({ lat: latitude, lng: longitude });
      }, (error) => {
        console.error("Error getting location:", error);
      });
    }
  }, []);

  useEffect(() => {
    console.log('best station updated:', bestStation);
  }, [bestStation]);

  const handleCalculateNaive = async () => {
    let numAPICalls = 0;
    setLoading(true);  // Set loading to true when the function starts

     // Clear previous route by resetting coordinates
  setStartLocationCoords(null);
  setDestinationCoords(null);
  setBestStation(null); // Clear the best station information
  setRouteInfo(null); // Clear the route information
  
    try {
      // Get latitude and longitude of start location
      const startLocationCoords = await geocodeAddress(startLocation);
      setStartLocationCoords(startLocationCoords);
  
      // Get latitude and longitude of destination
      const destinationCoords = await geocodeAddress(destination);
      setDestinationCoords(destinationCoords);
  
      // petrol station cost calculation
      if (startLocationCoords && destinationCoords) {
        const directionsService = new window.google.maps.DirectionsService();
        const costOfGettingPetrolAtStationMap = new Map();
  
        //iterate through each possible station
        const promises = petrolStations.map(async (station) => {
          const routeToStation = await directionsService.route({
            origin: startLocationCoords,
            destination: station.location,
            travelMode: window.google.maps.TravelMode.DRIVING,
          });
          numAPICalls++;
  
          const distanceToStationInMetres = routeToStation.routes[0].legs[0].distance?.value;
          const petrolToStation = distanceToStationInMetres / 1000 * fuelEfficiency / 100;
  
          // if it is possible to get to the station with petrol in tank
          if (petrolToStation < amountInTank) {
            const timeToStationInHours = routeToStation.routes[0].legs[0].duration?.value/3600;
            const timeCostOfGettingToPetrolStation = timeToStationInHours * timeCost;
            const petrolCostOfGettingToPetrolStation = petrolToStation * station.price_per_litre;

            const costOfFillingPetrol = amountToBuy * station.price_per_litre;
  
            const routeToDestination = await directionsService.route({
              origin: station.location,
              destination: destinationCoords,
              travelMode: window.google.maps.TravelMode.DRIVING,
            });
            numAPICalls++;
  
            const distanceToDestinationInMetres = routeToDestination.routes[0].legs[0].distance.value;
            const petrolToDestination = distanceToDestinationInMetres / 1000 * fuelEfficiency / 100;
            const timeToDestinationInHours = routeToDestination.routes[0].legs[0].duration.value/3600;
            const timeCostOfGettingToDestination = timeToDestinationInHours * timeCost;
            const petrolCostOfGettingToDestination = petrolToDestination * station.price_per_litre;
  
            costOfGettingPetrolAtStationMap.set(station.id, {
              totalCost: petrolCostOfGettingToPetrolStation + timeCostOfGettingToPetrolStation + costOfFillingPetrol + petrolCostOfGettingToDestination + timeCostOfGettingToDestination,
              fillingCost: costOfFillingPetrol,
              petrolCost: petrolCostOfGettingToPetrolStation + petrolCostOfGettingToDestination,
              timeCost: timeCostOfGettingToPetrolStation + timeCostOfGettingToDestination,
              timeInHours: timeToStationInHours + timeToDestinationInHours,
            });
          }
        });
  
        // Wait for all promises to resolve
        await Promise.all(promises);
  
        // Find the station with the lowest total cost
        let cheapestStationID = null;
        let cheapestCost: number | null = null;
        costOfGettingPetrolAtStationMap.forEach((costJson, stationID) => {
          if (cheapestCost === null || costJson.totalCost < cheapestCost) {
            cheapestCost = costJson.totalCost;
            cheapestStationID = stationID;
          }
        });
  
        const stationObject = petrolStations.find(station => station.id === cheapestStationID);
        setBestStation(stationObject || null);
        setRouteInfo(costOfGettingPetrolAtStationMap.get(cheapestStationID));
        console.log('num API calls: ', numAPICalls);
      }
    } catch (error) {
      console.error("Error calculating route:", error);
    } finally {
      setLoading(false);  // Set loading to false when the function completes
    }
  };

  const handleCalculateDijkstra = async () => {
    let numAPICalls = 0;
    setLoading(true);  // Set loading to true when the function starts

    // Clear previous route by resetting coordinates
    setStartLocationCoords(null);
    setDestinationCoords(null);
    setBestStation(null);  // Clear the best station information
    setRouteInfo(null);    // Clear the route information

    try {
        // Get latitude and longitude of start location
        const startLocationCoords = await geocodeAddress(startLocation);
        setStartLocationCoords(startLocationCoords);

        // Get latitude and longitude of destination
        const destinationCoords = await geocodeAddress(destination);
        setDestinationCoords(destinationCoords);

        if (startLocationCoords && destinationCoords) {
            const directionsService = new window.google.maps.DirectionsService();
            const allNodes = new Set();

            //initialise start, destination, and petrol stations as nodes
            allNodes.add({ 
              tentativeCost: 0, 
              previousNode: null,           
              stationInfoMap: {
              id: 'start',
              name: 'Start',
              location: startLocationCoords,
              price_per_litre: 0,
            }},);

            allNodes.add(
              {
                tentativeCost: Infinity, 
                previousNode: null,            
                stationInfoMap:{id: 'end',
              name: 'End',
              location: destinationCoords,
              price_per_litre: 0,}});

            //update tentative value for all unvisited nodes connected to start node (all petrol stations)
            const exploringAllNodesFromStartPromises = petrolStations.map(async (station) => {
              let tentativeCost = Infinity;
              const routeToStation = await directionsService.route({
                origin: startLocationCoords,
                destination: station.location,
                travelMode: window.google.maps.TravelMode.DRIVING,
              });
              numAPICalls++;

              const distanceToStationInMetres = routeToStation.routes[0].legs[0].distance?.value;
              const petrolToStation = distanceToStationInMetres / 1000 * fuelEfficiency / 100;
              const timeToStationInHours = routeToStation.routes[0].legs[0].duration?.value/3600;
              const timeCostOfGettingToPetrolStation = timeToStationInHours * timeCost;
              const petrolCostOfGettingToPetrolStation = petrolToStation * station.price_per_litre;
              const costOfFillingPetrol = amountToBuy * station.price_per_litre;
      
              // if it is possible to get to the station with petrol in tank, update tentative cost
              if (petrolToStation < amountInTank) {
                tentativeCost = timeCostOfGettingToPetrolStation + petrolCostOfGettingToPetrolStation + costOfFillingPetrol;
            }

            allNodes.add({
              tentativeCost: tentativeCost, 
              fillingCost: costOfFillingPetrol,
              tentativePetrolCost: petrolCostOfGettingToPetrolStation,
              tentativeTimeCost: timeCostOfGettingToPetrolStation,
              tentativeTimeInHours: timeToStationInHours, 
              previousNode: 'start',              
              stationInfoMap: station});
          });

            // Wait for all promises to resolve
        await Promise.all(exploringAllNodesFromStartPromises);

        //add all elements from allNodes to priorityQueue
        let unvisitedPriorityQueue = Array.from(allNodes);
        //remove the node with id "start" (already visited)
        unvisitedPriorityQueue = unvisitedPriorityQueue.filter(node => node.stationInfoMap.id !== 'start');

        let currentNode = null;

        while (unvisitedPriorityQueue.length > 0) {
         // Sort the queue to get the station with the lowest tentative cost
         unvisitedPriorityQueue.sort((a, b) => a.tentativeCost - b.tentativeCost);

        currentNode = unvisitedPriorityQueue.shift(); //removes the first element of the array (lowest cost station) and returns it
        console.log("current node ", currentNode);

        //if the current node is the destination, break (shortest path found)
        if (currentNode.stationInfoMap.id === 'end') {
          break;
        }

        //update tentative cost of all unvisited neighbours of the current node (in this case, just the destination node)
        const routeToDestination = await directionsService.route({
          origin: currentNode.stationInfoMap.location,
          destination: destinationCoords,
          travelMode: window.google.maps.TravelMode.DRIVING,
        });
        numAPICalls++;
  
        const distanceToDestinationInMetres = routeToDestination.routes[0].legs[0].distance.value;
        const petrolToDestination = distanceToDestinationInMetres / 1000 * fuelEfficiency / 100;
        const timeToDestinationInHours = routeToDestination.routes[0].legs[0].duration.value/3600;
        const timeCostOfGettingToDestination = timeToDestinationInHours * timeCost;
        const petrolCostOfGettingToDestination = petrolToDestination * currentNode.stationInfoMap.price_per_litre;

        // get the destination node
        const destinationNode = unvisitedPriorityQueue.find(node => node.stationInfoMap.id === 'end');
        const newTentativeCost = currentNode.tentativeCost + timeCostOfGettingToDestination + petrolCostOfGettingToDestination;
        // if have found a shorter path, update the destination node tentative costs
        if(newTentativeCost < destinationNode.tentativeCost) {
          destinationNode.tentativeCost = newTentativeCost;
          destinationNode.fillingCost = currentNode.fillingCost;
          destinationNode.tentativePetrolCost = currentNode.tentativePetrolCost + petrolCostOfGettingToDestination;
          destinationNode.tentativeTimeCost = currentNode.tentativeTimeCost + timeCostOfGettingToDestination;
          destinationNode.tentativeTimeInHours = currentNode.tentativeTimeInHours + timeToDestinationInHours;
          destinationNode.previousNode = currentNode.stationInfoMap.id;
        }
        }


        console.log("reached destination as current node ", currentNode);
        console.log("num API calls", numAPICalls);


        const costOfGettingPetrolAtBestStationMap = {
          totalCost: currentNode.tentativeCost,
          fillingCost: currentNode.fillingCost,
          petrolCost: currentNode.tentativePetrolCost,
          timeCost: currentNode.tentativeTimeCost,
          timeInHours: currentNode.tentativeTimeInHours,
        };

        const bestStationID = currentNode.previousNode;

        setBestStation(petrolStations.find(station => station.id === bestStationID) || null);
        setRouteInfo(costOfGettingPetrolAtBestStationMap);
         }
    } catch (error) {
        console.error("Error calculating route:", error);
    } finally {
        setLoading(false);  // Set loading to false when the function completes
    }
};

//gets distance estimate between 2 points (as the crow flies) based on latitude and longitude - used for distance heuristic estimate in astar algorithm
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  console.log("calculating haversine distance");
  const R = 6371; // Earth's radius in kilometers
  const toRad = (value) => value * Math.PI / 180; // Convert degrees to radians

  const deltaLat = toRad(lat2 - lat1);
  const deltaLon = toRad(lon2 - lon1);

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return distance;
};

const handleCalculateAstar = async () => {
  let numAPICalls = 0;
  setLoading(true);  // Set loading to true when the function starts


  // Clear previous route by resetting coordinates
  setStartLocationCoords(null);
  setDestinationCoords(null);
  setBestStation(null);  // Clear the best station information
  setRouteInfo(null);    // Clear the route information

  try {
      // Get latitude and longitude of start location
      const startLocationCoords = await geocodeAddress(startLocation);
      setStartLocationCoords(startLocationCoords);

      // Get latitude and longitude of destination
      const destinationCoords = await geocodeAddress(destination);
      setDestinationCoords(destinationCoords);

      if (startLocationCoords && destinationCoords) {
          const directionsService = new window.google.maps.DirectionsService();
          const allNodes = new Set();

          //initialise start, destination, and petrol stations as nodes
          allNodes.add({ 
            tentativeCost: 0, 
            heuristic: 0,
            previousNode: null,           
            stationInfoMap: {
            id: 'start',
            name: 'Start',
            location: startLocationCoords,
            price_per_litre: 0,
          }},);

          allNodes.add(
            {
              tentativeCost: Infinity, 
              heuristic: 0,
              previousNode: null,            
              stationInfoMap:{id: 'end',
            name: 'End',
            location: destinationCoords,
            price_per_litre: 0,}});

          //update tentative value for all unvisited nodes connected to start node (all petrol stations)
          const exploringAllNodesFromStartPromises = petrolStations.map(async (station) => {

            let tentativeCost = Infinity;
            const routeToStation = await directionsService.route({
              origin: startLocationCoords,
              destination: station.location,
              travelMode: window.google.maps.TravelMode.DRIVING,
            });
            numAPICalls++;

            const distanceToStationInMetres = routeToStation.routes[0].legs[0].distance?.value;
            const petrolToStation = distanceToStationInMetres / 1000 * fuelEfficiency / 100;
            const timeToStationInHours = routeToStation.routes[0].legs[0].duration?.value/3600;
            const timeCostOfGettingToPetrolStation = timeToStationInHours * timeCost;
            const petrolCostOfGettingToPetrolStation = petrolToStation * station.price_per_litre;
            const costOfFillingPetrol = amountToBuy * station.price_per_litre;
    
            // if it is possible to get to the station with petrol in tank, update tentative cost
            if (petrolToStation < amountInTank) {
              tentativeCost = timeCostOfGettingToPetrolStation + petrolCostOfGettingToPetrolStation + costOfFillingPetrol;
          }

          const distanceEstimateFromHaversine = haversineDistance(station.location.lat, station.location.lng, destinationCoords.lat, destinationCoords.lng);

          allNodes.add({
            tentativeCost: tentativeCost,
            heuristic: distanceEstimateFromHaversine*fuelEfficiency/100*station.price_per_litre,
            fillingCost: costOfFillingPetrol,
            tentativePetrolCost: petrolCostOfGettingToPetrolStation,
            tentativeTimeCost: timeCostOfGettingToPetrolStation,
            tentativeTimeInHours: timeToStationInHours, 
            previousNode: 'start',              
            stationInfoMap: station});
        });

          // Wait for all promises to resolve
      await Promise.all(exploringAllNodesFromStartPromises);

      //add all elements from allNodes to priorityQueue
      let unvisitedPriorityQueue = Array.from(allNodes);
      //remove the node with id "start" (already visited)
      unvisitedPriorityQueue = unvisitedPriorityQueue.filter(node => node.stationInfoMap.id !== 'start');

      let currentNode = null;

      while (unvisitedPriorityQueue.length > 0) {
       // Sort the queue to get the station with the lowest tentative cost
       unvisitedPriorityQueue.sort((a, b) => (a.tentativeCost + a.heuristic) - (b.tentativeCost + b.heuristic));

      currentNode = unvisitedPriorityQueue.shift(); //removes the first element of the array (lowest cost station) and returns it
      console.log("current node ", currentNode);

      //if the current node is the destination, break (shortest path found)
      if (currentNode.stationInfoMap.id === 'end') {
        break;
      }

      //update tentative cost of all unvisited neighbours of the current node (in this case, just the destination node)
      const routeToDestination = await directionsService.route({
        origin: currentNode.stationInfoMap.location,
        destination: destinationCoords,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });
      numAPICalls++;

      const distanceToDestinationInMetres = routeToDestination.routes[0].legs[0].distance.value;
      const petrolToDestination = distanceToDestinationInMetres / 1000 * fuelEfficiency / 100;
      const timeToDestinationInHours = routeToDestination.routes[0].legs[0].duration.value/3600;
      const timeCostOfGettingToDestination = timeToDestinationInHours * timeCost;
      const petrolCostOfGettingToDestination = petrolToDestination * currentNode.stationInfoMap.price_per_litre;

      // get the destination node
      const destinationNode = unvisitedPriorityQueue.find(node => node.stationInfoMap.id === 'end');
      const newTentativeCost = currentNode.tentativeCost + timeCostOfGettingToDestination + petrolCostOfGettingToDestination;
      // if have found a shorter path, update the destination node tentative costs
      if(newTentativeCost < destinationNode.tentativeCost) {
        destinationNode.tentativeCost = newTentativeCost;
        destinationNode.fillingCost = currentNode.fillingCost;
        destinationNode.tentativePetrolCost = currentNode.tentativePetrolCost + petrolCostOfGettingToDestination;
        destinationNode.tentativeTimeCost = currentNode.tentativeTimeCost + timeCostOfGettingToDestination;
        destinationNode.tentativeTimeInHours = currentNode.tentativeTimeInHours + timeToDestinationInHours;
        destinationNode.previousNode = currentNode.stationInfoMap.id;
      }
      }


      console.log("reached destination as current node ", currentNode);
      console.log("num API calls", numAPICalls);


      const costOfGettingPetrolAtBestStationMap = {
        totalCost: currentNode.tentativeCost,
        fillingCost: currentNode.fillingCost,
        petrolCost: currentNode.tentativePetrolCost,
        timeCost: currentNode.tentativeTimeCost,
        timeInHours: currentNode.tentativeTimeInHours,
      };

      const bestStationID = currentNode.previousNode;

      setBestStation(petrolStations.find(station => station.id === bestStationID) || null);
      setRouteInfo(costOfGettingPetrolAtBestStationMap);
       }
  } catch (error) {
      console.error("Error calculating route:", error);
  } finally {
      setLoading(false);  // Set loading to false when the function completes
  }
};
  

  return (
    <div className="flex h-screen items-center justify-center">
      {/* Loading Popup */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="p-4 bg-white rounded-lg shadow-lg">
            <p className="text-lg font-semibold text-gray-800">Optimising like a boss...</p>
          </div>
        </div>
      )}

      <div className="flex w-full h-full max-w-7xl p-4">
        {/* Left Column: Input and Station Info */}
        <div className="flex flex-col w-1/2 justify-center items-center px-8 gap-4">
          <header className="text-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Petrol Price Finder
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Find the most cost-efficient petrol station on your route.
            </p>
          </header>

          {/* Inputs */}
          <div className="flex flex-col gap-4 w-full">
            {/* Start Location Input */}
            <div className="flex flex-col">
              <label className="mb-1 text-gray-700">Start Location</label>
              <input
                type="text"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>

            {/* Destination Input */}
            <div className="flex flex-col">
              <label className="mb-1 text-gray-700">Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>

            {/* Fuel Efficiency and Time Input */}
            <div className="flex flex-row gap-4">
              <div className="flex-1">
                <label className="mb-1 text-gray-700">Fuel Efficiency (L/100km)</label>
                <input
                  type="number"
                  value={fuelEfficiency}
                  onChange={(e) => setFuelEfficiency(Number(e.target.value))}
                  className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>

              <div className="flex-1">
                <label className="mb-1 text-gray-700">Value of Time ($/hr)</label>
                <input
                  type="number"
                  value={timeCost}
                  onChange={(e) => setTimeCost(Number(e.target.value))}
                  className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
            </div>

            {/* Amounts Input */}
            <div className="flex flex-row justify-between gap-4">
              <div className="flex-1">
                <label className="mb-1 text-gray-700">Amount of Petrol to Buy (Litres)</label>
                <input
                  type="number"
                  value={amountToBuy}
                  onChange={(e) => setAmountToBuy(Number(e.target.value))}
                  className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>

              <div className="flex-1">
                <label className="mb-1 text-gray-700">Amount of Petrol in Tank (Litres)</label>
                <input
                  type="number"
                  value={amountInTank}
                  onChange={(e) => setAmountInTank(Number(e.target.value))}
                  className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
            </div>

            <button
              onClick={handleCalculateAstar}
              className="p-2 bg-blue-600 text-white rounded-md w-full">
              Calculate Route
            </button>
          </div>

          {/* Cheapest Station Info */}
          {bestStation && (
            <div>
              <p className="text-lg font-medium text-gray-800 dark:text-gray-100 text-center">
                Cheapest Station: {bestStation.name}
              </p>
              <div className="text-center mt-2">
                {/* More Info Button */}
                <button
                  onClick={toggleInfoPopup}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md">
                  More Info
                </button>
              </div>
            </div>
          )}

          {/* Info Popup (Modal) */}
          {isInfoPopupOpen && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                  Refueling at {bestStation?.name}
                </h2>

                {/* Petrol Prices and Costs */}
                <div className="flex flex-col gap-2">
                  <p className="text-gray-600 dark:text-gray-400">
                    Price of Refueling: ${routeInfo?.fillingCost.toFixed(2)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Cost of Petrol Consumed on Journey: ${routeInfo?.petrolCost.toFixed(2)}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Drive Time: {routeInfo?.timeInHours ? formatTime(routeInfo.timeInHours) : 'N/A'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    Time Cost: ${routeInfo?.timeCost.toFixed(2)}
                  </p>
                  <p className="text-black font-bold dark:text-gray-400">
                    Total Cost: ${routeInfo?.totalCost.toFixed(2)}
                  </p>
                </div>

                {/* Close Button */}
                <div className="mt-4 text-right">
                  <button
                    onClick={toggleInfoPopup}
                    className="px-4 py-2 bg-red-600 text-white rounded-md">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Google Map */}
        <div className="w-1/2 h-full">
          <GoogleMapComponent petrolStations={petrolStations} bestStationCoords={bestStation?.location} startCoords={startLocationCoords} endCoords={destinationCoords} />
        </div>
      </div>
    </div>
  );
}
