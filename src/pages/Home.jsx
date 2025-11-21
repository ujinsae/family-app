import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient.js";
import { Link } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("created_at");
  const [search, setSearch] = useState("");
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    fetchPosts();
  }, [sortBy, search]);

  const fetchPosts = async () => {
    setLoading(true);
    let query = supabase.from("posts").select("*, comments(*)");

    if (search) query = query.ilike("title", `%${search}%`);

    if (sortBy === "created_at") query = query.order("created_at", { ascending: false });
    else if (sortBy === "upvotes") query = query.order("upvotes", { ascending: false });

    const { data, error } = await query;
    if (error) console.error(error);
    else setPosts(data);
    setLoading(false);
  };

  // Fixed handleUpvote with instant UI update
  const handleUpvote = async (postId) => {
    // Update UI immediately
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, upvotes: (post.upvotes || 0) + 1 } : post
      )
    );

    // Update in Supabase
    const post = posts.find((p) => p.id === postId);
    const newUpvotes = (post?.upvotes || 0) + 1;

    const { error } = await supabase
      .from("posts")
      .update({ upvotes: newUpvotes })
      .eq("id", postId);

    if (error) console.error(error);
  };

  const handleCommentSubmit = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText) return;

    // Update UI immediately
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, comments: [...(post.comments || []), { comment: commentText, id: Date.now() }] }
          : post
      )
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));

    // Save in Supabase
    const { error } = await supabase.from("comments").insert([{ post_id: postId, comment: commentText }]);
    if (error) console.error(error);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Family Memories</h1>

      {/* Create Post Button */}
      <div style={{ marginBottom: "10px" }}>
        <Link to="/create">
          <button
            style={{
              backgroundColor: "#4CAF50",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
            }}
          >
            + Create Post
          </button>
        </Link>
      </div>

      {/* Search and Sort */}
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="created_at">Newest</option>
          <option value="upvotes">Most Upvoted</option>
        </select>
      </div>

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "15px",
          }}
        >
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                overflow: "hidden",
                background: "#fff",
                padding: "10px",
              }}
            >
              <Link to={`/post/${post.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "10px" }}
                  />
                )}
                <h3>{post.title}</h3>
              </Link>

              <p>{post.content}</p>
              <p style={{ fontSize: "12px", color: "#555" }}>
                {new Date(post.created_at).toLocaleString()}
              </p>

              <div style={{ margin: "10px 0" }}>
                <button onClick={() => handleUpvote(post.id)}>⬆ Upvote</button>
                <span style={{ marginLeft: "10px" }}>Upvotes: {post.upvotes}</span>
              </div>

              <div>
                <h4>Comments ({post.comments?.length || 0})</h4>
                {post.comments?.map((c) => (
                  <p key={c.id} style={{ fontSize: "12px", color: "#333" }}>
                    {c.comment}
                  </p>
                ))}

                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentInputs[post.id] || ""}
                  onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                />
                <button onClick={() => handleCommentSubmit(post.id)}>Comment</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
