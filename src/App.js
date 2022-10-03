import "./App.css";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
// Font Awesome Imports
import { faAnglesDown, faAnglesUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "react-modal";

Modal.setAppElement("#root");

const getNewComment = (commentValue, isRootNode = false, parentNodeId) => {
  return {
    id: uuidv4(),
    commentText: commentValue,
    childCommments: [],
    isRootNode,
    parentNodeId,
  };
};

const initialState = {};

function App() {
  const [comments, setComments] = useState(initialState);
  const [rootComment, setRootComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [modalInput, setModalInput] = useState("");
  const [currentId, setCurrentId] = useState(null);
  const editComment = (id, value) => {
    const commentsCopy = { ...comments };
    commentsCopy[id].commentText = value;
    setComments(commentsCopy);
    setIsOpen(false);
  };

  const openModal = (modalInput, id) => {
    setCurrentId(id)
    setModalInput(modalInput);
    setIsOpen(true);
  };
  console.log("comments", comments);
  
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };
  const addComment = (parentId, newCommentText) => {
    let newComment = null;
    console.log(comments);
    if (parentId) {
      newComment = getNewComment(newCommentText, false, parentId);
      setComments((comments) => ({
        ...comments,
        [parentId]: {
          ...comments[parentId],
          childCommments: [...comments[parentId].childCommments, newComment.id],
        },
      }));
    } else {
      newComment = getNewComment(newCommentText, true, null);
    }
    setComments((comments) => ({ ...comments, [newComment.id]: newComment }));
    console.log("after update", { ...comments, [newComment.id]: newComment });
  };
  const deleteComment = (id) => {
    setComments((comments) => {
      console.log("ondelete", comments);
      console.log("item to be deleted", comments[id]);
      const tempComments = { ...comments };

      delete tempComments[id];
      console.log("after deletion", tempComments);
      return tempComments;
    });
  };
  const commentMapper = (comment) => {
    return {
      ...comment,
      childCommments: comment?.childCommments
        ? comment.childCommments
            .map((id) => comments[id])
            .map((comment) => commentMapper(comment))
        : null,
    };
  };
  const enhancedComments = Object.values(comments)
    .filter((comment) => {
      return !comment.parentNodeId;
    })
    .map(commentMapper);
  console.log("enhancedComments", enhancedComments);
  const onAdd = () => {
    addComment(null, rootComment);
    setRootComment("");
  };
  const onDelete = () => {
    setComments({});
  };
  return (
    <div className="App">
      <header style={{ marginBottom: "2rem", fontSize: "2rem" }}>
        Nested Comment Example
      </header>
      <Modal
        isOpen={isOpen}
        onRequestClose={toggleModal}
        contentLabel="My dialog"
      >
        <input
          value={modalInput}
          onChange={(e) => setModalInput(e.target.value)}
        />
        <button onClick={()=>editComment(currentId, modalInput)}>Update</button>
      </Modal>

      <div className="comments-container">
        <input
          type="text"
          value={rootComment}
          onChange={(e) => setRootComment(e.target.value)}
          placeholder="add comment"
          style={{ width: "80%", marginRight: "1rem" }}
        />{" "}
        <button disabled={!rootComment} onClick={onAdd}>
          Add
        </button>
        <button onClick={onDelete}>Delete</button>
      </div>
      <div
        style={{
          border: "1px solid blue",
          width: "90%",
          margin: "auto",
          overflowX: "auto",
          padding: "1rem",
        }}
      >
        {enhancedComments.map((comment, key) => {
          return (
            <Comment
              key={key}
              comment={comment}
              addComment={addComment}
              deleteComment={deleteComment}
              toggleModal={toggleModal}
              editComment={editComment}
              openModal={openModal}
            />
          );
        })}
      </div>
    </div>
  );
}

const Comment = ({
  comment,
  addComment,
  deleteComment,
  toggleModal,
  editComment,
  openModal,
}) => {
  const { commentText, childCommments, id } = comment;
  const [childComment, setChildComment] = useState("");
  const [show, setShow] = useState(true);
  const [showAddComponent, setShowAddComponent] = useState(false);
  const onAdd = () => {
    addComment(id, childComment);
    setChildComment("");
    setShowAddComponent(false);
  };

  const deleteBlock = () => {
    deleteComment(id);
  };

  return (
    <div className="Comment">
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <div style={{ textAlign: "left" }}>{commentText}</div>
        &nbsp;
        {childCommments?.length > 0 && (
          <span onClick={() => setShow((show) => !show)}>
            {show ? (
              <FontAwesomeIcon icon={faAnglesUp} />
            ) : (
              <FontAwesomeIcon icon={faAnglesDown} />
            )}
          </span>
        )}
      </div>
      <div>
        <div>
          {showAddComponent ? (
            <>
              <input
                type="text"
                value={childComment}
                onChange={(e) => setChildComment(e.target.value)}
                placeholder="add comment"
              />{" "}
              <button onClick={onAdd}>Submit</button>
            </>
          ) : commentText ? (
            <div>
              <button
                style={{ cursor: "pointer", fontSize: "0.7rem", color: "blue" }}
                onClick={() => setShowAddComponent(true)}
              >
                Reply
              </button>
              <button onClick={deleteBlock}>delete</button>
              <button onClick={() => openModal(commentText, id)}>Edit</button>
            </div>
          ) : null}
        </div>
      </div>
      {show &&
        childCommments &&
        childCommments.map((childCommentEl, key) => {
          return (
            childCommentEl && (
              <Comment
                key={key}
                comment={childCommentEl}
                addComment={addComment}
                deleteComment={deleteComment}
                toggleModal={toggleModal}
                editComment={editComment}
                openModal={openModal}
              />
            )
          );
        })}
    </div>
  );
};

export default App;
