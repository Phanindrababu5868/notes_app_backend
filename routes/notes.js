const express = require("express");
const Note = require("../models/Note");
const auth = require("../middleware/auth");

const router = express.Router();

//@description     Create new notes
//@route           POST /api/notes
//@access          user (owner)
router.post("/", auth, async (req, res) => {
  const { title, content, tags, backgroundColor } = req.body;

  try {
    const newNote = new Note({
      userId: req.user.id,
      title,
      content,
      tags,
      backgroundColor,
    });

    const note = await newNote.save();
    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//@description     fetch all notes
//@route           GET /api/notes
//@access          user (owner)
router.get("/", auth, async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.user.id,
      isArchived: false,
      isTrashed: false,
    }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//@description     Archive Single note
//@route           GET /api/notes/archive
//@access          user (owner)
router.get("/archive", auth, async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.user.id,
      isArchived: true,
    }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//@description     Trash Single note
//@route           GET /api/notes/trash
//@access          user (owner)
router.get("/trash", auth, async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.user.id,
      isTrashed: true,
    }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//@description     Search note
//@route           GET /api/notes/search
//@access          user (owner)
router.get("/search", auth, async (req, res) => {
  const { query } = req.query;

  console.log(query);

  try {
    const notes = await Note.find({
      userId: req.user.id,
      isTrashed: false,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//@description     Update note
//@route           PUT /api/notes/:id
//@access          user (owner)
router.put("/:id", auth, async (req, res) => {
  const { title, content, tags, backgroundColor, isArchived, isTrashed } =
    req.body;

  try {
    let note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.userId.toString() !== req.user.id)
      return res.status(401).json({ message: "Unauthorized" });

    note = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        tags,
        backgroundColor,
        isArchived,
        isTrashed,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.json(note);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//@description     Delete note
//@route           DELETE /api/notes/:id
//@access          user (owner)
router.delete("/:id", auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.userId.toString() !== req.user.id)
      return res.status(401).json({ message: "Unauthorized" });

    await Note.findByIdAndDelete(req.params.id);

    res.json({ message: "Note removed" });
  } catch (err) {
    console.error(
      `Error deleting note with id ${req.params.id}: ${err.message}`
    );
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
