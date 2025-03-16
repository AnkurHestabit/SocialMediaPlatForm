import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { addPost } from "../../redux/slices/postsSlice";
import CreatePostForm from "../PostForm";

jest.mock("../../redux/slices/postsSlice", () => ({
  addPost: jest.fn(), // ✅ Mock the addPost action
}));

const mockStore = configureStore([]);
const mockDispatch = jest.fn();
const mockOnClose = jest.fn();

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
}));

describe("CreatePostForm", () => {
  let store;

  beforeEach(() => {
    store = mockStore({ posts: [] });
    sessionStorage.setItem("user", JSON.stringify({ _id: "12345" })); // ✅ Simulate a logged-in user
  });

  test("renders input fields and buttons", () => {
    render(
      <Provider store={store}>
        <CreatePostForm onClose={mockOnClose} />
      </Provider>
    );

    expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Content")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Post")).toBeDisabled(); // Button should be disabled initially
  });

  test("enables the submit button when title and content are filled", () => {
    render(
      <Provider store={store}>
        <CreatePostForm onClose={mockOnClose} />
      </Provider>
    );

    const titleInput = screen.getByPlaceholderText("Title");
    const contentInput = screen.getByPlaceholderText("Content");
    const submitButton = screen.getByText("Post");

    fireEvent.change(titleInput, { target: { value: "Test Title" } });
    fireEvent.change(contentInput, { target: { value: "Test Content" } });

    expect(submitButton).not.toBeDisabled(); // Button should be enabled
  });

  test("dispatches addPost action on form submission", async () => {
    addPost.mockReturnValue(() => Promise.resolve()); // ✅ Mock API call

    render(
      <Provider store={store}>
        <CreatePostForm onClose={mockOnClose} />
      </Provider>
    );

    const titleInput = screen.getByPlaceholderText("Title");
    const contentInput = screen.getByPlaceholderText("Content");
    const submitButton = screen.getByText("Post");

    fireEvent.change(titleInput, { target: { value: "New Post" } });
    fireEvent.change(contentInput, { target: { value: "This is a new post." } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
      // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
      expect(addPost).toHaveBeenCalledWith({
        userId: "12345",
        title: "New Post",
        content: "This is a new post.",
      });
    });

    expect(mockOnClose).toHaveBeenCalled(); // ✅ Ensure onClose is called
  });

  test("shows alert if user is not logged in", () => {
    sessionStorage.removeItem("user"); // ✅ Simulate logged-out state
    window.alert = jest.fn(); // ✅ Mock alert

    render(
      <Provider store={store}>
        <CreatePostForm onClose={mockOnClose} />
      </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText("Title"), {
      target: { value: "Test Post" },
    });

    fireEvent.change(screen.getByPlaceholderText("Content"), {
      target: { value: "Test content" },
    });

    fireEvent.click(screen.getByText("Post"));

    expect(window.alert).toHaveBeenCalledWith("User not found. Please log in.");
  });
});
