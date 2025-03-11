import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import CommentForm from "../CommentForm"; // Adjust path if needed
import { addComment } from "../../redux/slices/postsSlice"; // ✅ Import action
import { SocketContext } from "../../context/SocketContext"; // ✅ Import SocketContext

jest.mock("../../redux/slices/postsSlice", () => ({
  addComment: jest.fn(), // ✅ Mock addComment
}));

const mockStore = configureStore([]);
const mockDispatch = jest.fn();

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
}));

describe("CommentForm", () => {
  let store;
  let mockSocket;

  beforeEach(() => {
    store = mockStore({ comments: [] });
    sessionStorage.setItem("user", JSON.stringify({ _id: "12345" }));

    mockSocket = { emit: jest.fn() }; // ✅ Mock socket
  });

  test("renders input and submit button", () => {
    render(
      <Provider store={store}>
        <SocketContext.Provider value={mockSocket}>
          <CommentForm postId="post123" />
        </SocketContext.Provider>
      </Provider>
    );

    expect(screen.getByPlaceholderText("Write a comment...")).toBeInTheDocument();
    expect(screen.getByText("💬 Comment")).toBeDisabled(); // Initially disabled
  });

  test("enables submit button when input is filled", () => {
    render(
      <Provider store={store}>
        <SocketContext.Provider value={mockSocket}>
          <CommentForm postId="post123" />
        </SocketContext.Provider>
      </Provider>
    );

    const input = screen.getByPlaceholderText("Write a comment...");
    const button = screen.getByText("💬 Comment");

    fireEvent.change(input, { target: { value: "Test comment" } });

    expect(button).not.toBeDisabled(); // Should be enabled
  });

  test("dispatches addComment action and emits socket event on submit", async () => {
    addComment.mockReturnValue(() => Promise.resolve()); // ✅ Mock action

    render(
      <Provider store={store}>
        <SocketContext.Provider value={mockSocket}>
          <CommentForm postId="post123" />
        </SocketContext.Provider>
      </Provider>
    );

    const input = screen.getByPlaceholderText("Write a comment...");
    fireEvent.change(input, { target: { value: "Test comment" } });

    const button = screen.getByText("💬 Comment");
    fireEvent.click(button);

    // ✅ Wait for the dispatch to be called
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
      expect(addComment).toHaveBeenCalledWith({
        postId: "post123",
        text: "Test comment",
        userId: "12345",
      });
    });

    // ✅ Ensure socket event was emitted
    expect(mockSocket.emit).toHaveBeenCalledWith("newComment", {
      postId: "post123",
      text: "Test comment",
      userId: "12345",
    });
  });

  test("shows alert if user is not logged in", () => {
    sessionStorage.removeItem("user"); // Simulate logged-out state
    window.alert = jest.fn(); // Mock alert

    render(
      <Provider store={store}>
        <SocketContext.Provider value={mockSocket}>
          <CommentForm postId="post123" />
        </SocketContext.Provider>
      </Provider>
    );

    fireEvent.change(screen.getByPlaceholderText("Write a comment..."), {
      target: { value: "Test comment" },
    });

    fireEvent.click(screen.getByText("💬 Comment"));

    expect(window.alert).toHaveBeenCalledWith("User not found. Please log in.");
  });
});
