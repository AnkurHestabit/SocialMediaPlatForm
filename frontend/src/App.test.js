import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import store  from "./redux/store"; // Make sure the path is correct
import App from './App';

test("renders learn react link", () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
});
