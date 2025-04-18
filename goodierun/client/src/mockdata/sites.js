// Mock sites data with numeric IDs
export const sites = [
  {
    id: 1,
    sub: 'stadium-a',
    registrationCode: 'SA-REG-001',
    type: 'stadium',
    address: '123 Stadium Way',
    city: 'Los Angeles',
    state: 'CA',
    name: 'Stadium A',
    prefix: 'SA',
    isOpen: true,
    latitude: 34.0522,
    longitude: -118.2437,
    mapUrl: 'https://maps.example.com/stadium-a'
  },
  {
    id: 2,
    sub: 'stadium-b',
    registrationCode: 'SB-REG-001',
    type: 'stadium',
    address: '456 Arena Boulevard',
    city: 'San Francisco',
    state: 'CA',
    name: 'Stadium B',
    prefix: 'SB',
    isOpen: true,
    latitude: 37.7749,
    longitude: -122.4194,
    mapUrl: 'https://maps.example.com/stadium-b'
  }
];

// Helper function to generate new ID
export const getNextId = () => {
  return Math.max(...sites.map(site => site.id)) + 1;
};

// Helper function to find site by ID
export const findSiteById = (id) => {
  return sites.find(site => site.id === id);
};
