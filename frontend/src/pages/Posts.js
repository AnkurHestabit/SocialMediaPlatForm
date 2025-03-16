import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "../redux/slices/postsSlice";
import PostList from "../components/PostList";

const Posts = () => {
    const dispatch = useDispatch();
    const { posts, loading, error } = useSelector((state) => state.posts);
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        if (user?._id) {
            dispatch(fetchPosts(user._id));
        }
    }, [dispatch, user]);

    return (
        <div className="max-w-2xl mx-auto p-4">
            {loading && <p>Loading posts...</p>}
            {error && <p className="text-red-500">{error}</p>}
            <PostList posts={posts} />
        </div>
    );
};

export default Posts;
