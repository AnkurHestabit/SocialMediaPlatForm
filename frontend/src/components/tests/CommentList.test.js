import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { SocketContext } from "../../context/SocketContext";
import CommentList from "../CommentList";
import { removeComment } from "../../redux/slices/postsSlice";

jest.mock("../../redux/slices/postsSlice", () => ({
  removeComment: jest.fn(),
}));

const mockStore = configureStore([]);
const mockSocket = { emit: jest.fn() };

describe("CommentList Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({});
    store.dispatch = jest.fn(); // Mock dispatch function

    // Mock session storage for logged-in user
    sessionStorage.setItem("user", JSON.stringify({ _id: "12345" }));
  });

  afterEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  const mockComments = [
    {
      _id: "comment1",
      text: "User's own comment",
      user: "12345", // This comment belongs to the logged-in user
    },
    {
      _id: "comment2",
      text: "Another user's comment",
      user: "67890", // This belongs to another user
    },
  ];

  test("renders comments correctly", () => {
    render(
      <Provider store={store}>
        <SocketContext.Provider value={mockSocket}>
          <CommentList postId="post123" comments={mockComments} />
        </SocketContext.Provider>
      </Provider>
    );

    // Ensure comments are displayed
    expect(screen.getByText("User's own comment")).toBeInTheDocument();
    expect(screen.getByText("Another user's comment")).toBeInTheDocument();
  });

  test("shows delete button only for the logged-in user's comments", () => {
    render(
      <Provider store={store}>
        <SocketContext.Provider value={mockSocket}>
          <CommentList postId="post123" comments={mockComments} />
        </SocketContext.Provider>
      </Provider>
    );

    // Delete button should be present for the user's own comment
    expect(screen.getByRole("button", { name: "❌" })).toBeInTheDocument();

    // Ensure there's only one delete button (for the logged-in user's comment)
    expect(screen.getAllByRole("button", { name: "❌" })).toHaveLength(1);
  });

  test("does not show delete button for another user's comments", () => {
    render(
      <Provider store={store}>
        <SocketContext.Provider value={mockSocket}>
          <CommentList postId="post123" comments={mockComments} />
        </SocketContext.Provider>
      </Provider>
    );

    // Ensure the delete button is not present for the second comment
    const userComments = screen.getByText("User's own comment");
    const otherUserComments = screen.getByText("Another user's comment");

    expect(userComments).toBeInTheDocument();
    expect(otherUserComments).toBeInTheDocument();

    // Ensure only one delete button exists (not for the other user's comment)
    expect(screen.getAllByRole("button", { name: "❌" })).toHaveLength(1);
  });

  test("dispatches removeComment action and emits delete event on delete", () => {
    window.confirm = jest.fn(() => true); // Mock confirmation

    render(
      <Provider store={store}>
        <SocketContext.Provider value={mockSocket}>
          <CommentList postId="post123" comments={mockComments} />
        </SocketContext.Provider>
      </Provider>
    );

    const deleteButton = screen.getByRole("button", { name: "❌" });
    fireEvent.click(deleteButton);

    // Ensure confirmation was shown
    expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to delete this comment?");

    // Ensure removeComment action was dispatched
    expect(store.dispatch).toHaveBeenCalledWith(
      removeComment({ postId: "post123", commentId: "comment1" })
    );

    // Ensure socket event was emitted
    expect(mockSocket.emit).toHaveBeenCalledWith("deleteComment", { postId: "post123", commentId: "comment1" });
  });

  test("does not dispatch action if delete is canceled", () => {
    window.confirm = jest.fn(() => false); // Mock user canceling deletion

    render(
      <Provider store={store}>
        <SocketContext.Provider value={mockSocket}>
          <CommentList postId="post123" comments={mockComments} />
        </SocketContext.Provider>
      </Provider>
    );

    const deleteButton = screen.getByRole("button", { name: "❌" });
    fireEvent.click(deleteButton);

    // Ensure confirmation was shown
    expect(window.confirm).toHaveBeenCalledWith("Are you sure you want to delete this comment?");

    // Ensure removeComment was NOT dispatched
    expect(store.dispatch).not.toHaveBeenCalled();

    // Ensure socket event was NOT emitted
    expect(mockSocket.emit).not.toHaveBeenCalled();
  });

  test("displays 'No comments yet' when comment list is empty", () => {
    render(
      <Provider store={store}>
        <SocketContext.Provider value={mockSocket}>
          <CommentList postId="post123" comments={[]} />
        </SocketContext.Provider>
      </Provider>
    );

    expect(screen.getByText("No comments yet.")).toBeInTheDocument();
  });
});
