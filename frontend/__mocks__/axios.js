const axiosMock = jest.createMockFromModule("axios");

// Mock `create()` to return an Axios-like instance with interceptors
axiosMock.create = jest.fn(() => ({
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

module.exports = axiosMock;
