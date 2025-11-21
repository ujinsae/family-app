import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient.js";

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    fetchPost();
  }, []);

  const fetchPost = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*, comments(*)")
      .eq("id", id)
      .single();
    if (error) console.error(error);
    else {
      setPost(data);
      setTitle(data.title);
      setContent(data.content);
      setImageUrl(data.image_url);
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    const { error } = await supabase
      .from("posts")
      .update({ title, content, image_url: imageUrl })
      .eq("id", id);

    if (error) console.error(error);
    else {
      setEditMode(false);
      fetchPost();
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) console.error(error);
    else navigate("/");
  };

  if (loading) return <p>Loading...</p>;
  if (!post) return <p>Post not found</p>;

  return (
    <div style={{ padding: "20px" }}>
      {editMode ? (
        <div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} />
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <button onClick={handleUpdate}>Save</button>
          <button onClick={() => setEditMode(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          {post.image_url && (
            <img src={post.image_url} alt={post.title} style={{ width: "100%", maxHeight: "400px", objectFit: "cover" }} />
          )}
          <h1>{post.title}</h1>
          <p>{post.content}</p>
          <p>Upvotes: {post.upvotes}</p>
          <button onClick={() => setEditMode(true)}>Edit Post</button>
          <button onClick={handleDelete}>Delete Post</button>
        </div>
      )}

      <div>
        <h3>Comments</h3>
        {post.comments.map((c) => (
          <p key={c.id}>{c.comment}</p>
        ))}
      </div>
    </div>
  );
}
