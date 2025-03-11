const reactRouterDom = jest.createMockFromModule('react-router-dom');

module.exports = {
  ...reactRouterDom,
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => <div>{element}</div>,
  Navigate: jest.fn(),
  useNavigate: () => jest.fn(),
  useLocation: () => ({
    pathname: '/',
  }),
  useParams: () => ({}),
};
