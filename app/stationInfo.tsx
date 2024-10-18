// stationInfo.ts

// Define the PetrolStation interface
export interface PetrolStation {
    id: string;
    name: string;
    location: {
      lat: number;
      lng: number;
    };
    price_per_litre: number;
  }
  
  // Define the petrolStations array
  const petrolStations: PetrolStation[] = [
    {
        id: 'station1',
        name: 'Costco Canberra Airport Majura Park',
        location: { lat: -35.3, lng: 149.19 },
        price_per_litre: 1.677,
      },
      {
        id: 'station2',
        name: 'Ampol Canberra Airport Pialligo',
        location: { lat: -35.31, lng: 149.19 },
        price_per_litre: 1.707,
      },
      {
        id: 'station3',
        name: 'Ampol Queanbeyan',
        location: { lat: -35.36, lng: 149.21 },
        price_per_litre: 1.712,
      },
      {
        id: 'station4',
        name: 'BP Queanbeyan (Yass Rd)',
        location: { lat: -35.34, lng: 149.24 },
        price_per_litre: 1.723,
      },
      {
        id: 'station5',
        name: '7-Eleven Jerrabomberra',
        location: { lat: -35.38, lng: 149.2 },
        price_per_litre: 1.732,
      },
      {
        id: 'station6',
        name: '7-Eleven Karabar',
        location: { lat: -35.37, lng: 149.23 },
        price_per_litre: 1.732,
      },
      {
        id: 'station7',
        name: 'Coles Express Queanbeyan East',
        location: { lat: -35.35, lng: 149.24 },
        price_per_litre: 1.736,
      },
      {
        id: 'station8',
        name: 'Ampol Queanbeyan Bungendore Rd',
        location: { lat: -35.35, lng: 149.24 },
        price_per_litre: 1.734,
      },
      {
        id: 'station9',
        name: '7-Eleven Fyshwick',
        location: { lat: -35.33, lng: 149.15 },
        price_per_litre: 1.734,
      },
      {
        id: 'station10',
        name: 'BP Express Phillip',
        location: { lat: -35.35, lng: 149.09 },
        price_per_litre: 1.736,
      },
      {
        id: 'station11',
        name: 'BP Fyshwick',
        location: { lat: -35.33, lng: 149.16 },
        price_per_litre: 1.736,
      },
      {
        id: 'station12',
        name: 'BP Express Chisholm',
        location: { lat: -35.41, lng: 149.13 },
        price_per_litre: 1.740,
      },
      {
        id: 'station13',
        name: 'Ampol Weston Creek',
        location: { lat: -35.32, lng: 149.06 },
        price_per_litre: 1.743,
      },
      {
        id: 'station14',
        name: 'Ampol Foodary Weston',
        location: { lat: -35.34, lng: 149.05 },
        price_per_litre: 1.743,
      },
      {
        id: 'station15',
        name: 'Ampol Calwell',
        location: { lat: -35.43, lng: 149.11 },
        price_per_litre: 1.749,
      },
      {
        id: 'station16',
        name: '7-Eleven Mawson',
        location: { lat: -35.36, lng: 149.09 },
        price_per_litre: 1.755,
      },
      {
        id: 'station17',
        name: '7-Eleven Phillip',
        location: { lat: -35.35, lng: 149.09 },
        price_per_litre: 1.758,
      },
      {
        id: 'station18',
        name: 'BP Express Kingston',
        location: { lat: -35.32, lng: 149.14 },
        price_per_litre: 1.758,
      },
      {
        id: 'station19',
        name: 'Ampol Foodary Kambah',
        location: { lat: -35.38, lng: 149.06 },
        price_per_litre: 1.762,
      },
      {
        id: 'station20',
        name: '7-Eleven Erindale',
        location: { lat: -35.41, lng: 149.1 },
        price_per_litre: 1.766,
      },
      {
        id: 'station21',
        name: 'BP Watson',
        location: { lat: -35.22, lng: 149.17 },
        price_per_litre: 1.767,
      },
      {
        id: 'station22',
        name: 'Ampol Mitchell',
        location: { lat: -35.21, lng: 149.14 },
        price_per_litre: 1.775,
      },
      {
        id: 'station23',
        name: 'Coles Express Fyshwick Wiluna',
        location: { lat: -35.33, lng: 149.16 },
        price_per_litre: 1.780,
      },
      {
        id: 'station24',
        name: 'Ampol Holt',
        location: { lat: -35.22, lng: 149.02 },
        price_per_litre: 1.781,
      },
      {
        id: 'station25',
        name: '7-Eleven Holt',
        location: { lat: -35.22, lng: 149.02 },
        price_per_litre: 1.781,
      },
      {
        id: 'station26',
        name: 'Ampol Kaleen',
        location: { lat: -35.23, lng: 149.1 },
        price_per_litre: 1.782,
      },
      {
        id: 'station27',
        name: '7-Eleven Giralang',
        location: { lat: -35.21, lng: 149.1 },
        price_per_litre: 1.784,
      },
      {
        id: 'station28',
        name: 'BP Braddon',
        location: { lat: -35.28, lng: 149.13 },
        price_per_litre: 1.787,
      },
      {
        id: 'station29',
        name: 'Coles Express Fyshwick Capital',
        location: { lat: -35.33, lng: 149.18 },
        price_per_litre: 1.793,
      },
      {
        id: 'station30',
        name: 'BP Jamison',
        location: { lat: -35.25, lng: 149.07 },
        price_per_litre: 1.792,
      },
      {
        id: 'station31',
        name: 'Ampol Nicholls',
        location: { lat: -35.19, lng: 149.08 },
        price_per_litre: 1.794,
      },
      {
        id: 'station32',
        name: '7-Eleven Casey',
        location: { lat: -35.18, lng: 149.1 },
        price_per_litre: 1.796,
      },
      {
        id: 'station33',
        name: 'Coles Express Curtin',
        location: { lat: -35.32, lng: 149.08 },
        price_per_litre: 1.800,
      },
      {
        id: 'station34',
        name: 'Coles Express Phillip',
        location: { lat: -35.35, lng: 149.08 },
        price_per_litre: 1.804,
      },
      {
        id: 'station35',
        name: '7-Eleven Braddon',
        location: { lat: -35.28, lng: 149.13 },
        price_per_litre: 1.807,
      },
      {
        id: 'station36',
        name: 'Ampol Braddon',
        location: { lat: -35.27, lng: 149.13 },
        price_per_litre: 1.807,
      },
      {
        id: 'station37',
        name: 'Coles Express Deakin',
        location: { lat: -35.31, lng: 149.12 },
        price_per_litre: 1.808,
      },
      {
        id: 'station38',
        name: 'Coles Express Wanniassa',
        location: { lat: -35.39, lng: 149.09 },
        price_per_litre: 1.810,
      },
      {
        id: 'station39',
        name: 'BP Nicholls',
        location: { lat: -35.19, lng: 149.09 },
        price_per_litre: 1.806,
      },
      {
        id: 'station40',
        name: 'Coles Express Tuggeranong',
        location: { lat: -35.42, lng: 149.07 },
        price_per_litre: 1.817,
      },
      {
        id: 'station41',
        name: 'Coles Express Manuka',
        location: { lat: -35.32, lng: 149.13 },
        price_per_litre: 1.819,
      },
      {
        id: 'station42',
        name: 'Coles Express Belconnen',
        location: { lat: -35.24, lng: 149.06 },
        price_per_litre: 1.821,
      },
      {
        id: 'station43',
        name: 'Coles Express Belconnen Town Centre',
        location: { lat: -35.24, lng: 149.06 },
        price_per_litre: 1.824,
      },
      {
        id: 'station44',
        name: 'Coles Express Hawker',
        location: { lat: -35.24, lng: 149.04 },
        price_per_litre: 1.834,
      },
      {
        id: 'station45',
        name: 'Coles Express Gungahlin',
        location: { lat: -35.18, lng: 149.13 },
        price_per_litre: 1.835,
      },
      {
        id: 'station46',
        name: '7-Eleven Melba',
        location: { lat: -35.21, lng: 149.05 },
        price_per_litre: 1.833,
      },
      {
        id: 'station47',
        name: '7-Eleven Spence',
        location: { lat: -35.19, lng: 149.06 },
        price_per_litre: 1.833,
      },
      {
        id: 'station48',
        name: 'Coles Express Braddon',
        location: { lat: -35.27, lng: 149.13 },
        price_per_litre: 1.840,
      },
      {
        id: 'station49',
        name: 'Coles Express Dickson',
        location: { lat: -35.25, lng: 149.14 },
        price_per_litre: 1.841,
      },
      {
        id: 'station50',
        name: 'Ampol Fyshwick',
        location: { lat: -35.33, lng: 149.17 },
        price_per_litre: 1.856,
      },
      {
        id: 'station51',
        name: 'Coles Express Charnwood',
        location: { lat: -35.21, lng: 149.03 },
        price_per_litre: 1.848,
      },            
  ];
  
  // Default export the petrolStations array
  export default petrolStations;
  