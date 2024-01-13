import { cloudinary } from "../middleware/cloudinary.js"
import { Test } from "../models/Test.js";
import pkg from "mongodb";
const { ObjectID } = pkg;

export const test = async (req, res) => {
  try {
    let image;

    // check if the user uploaded a file, if yes upload to cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      image = {
        url: result.url,
        public_id: result.public_id,
      };
    }

    const newEntry = await Test.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      imageUrl: image.url || null,
      cloudinaryId: image.public_id || null,
      likes: 0
    });
  
    res.status(200).send({ message: "Success!", data: newEntry });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "An error occurred", error: err.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Test.find() 
    res.json({ posts: posts })
  } catch(err) {
    console.error(err)
    res.status(500).json({ message: "Internal Server Error" })
  }
}

export const likePost = async (req, res) => {
  try {

    const updatedPost = await Test.findOneAndUpdate(
      { _id: req.params.id },
      { $inc: {likes: 1} },
      { new: true }
    )

    if (!updatedPost) {
      return res.status(404).send('Post not found');
    }

    res.json(updatedPost);    

  } catch (err) {
    console.error(err)
  }
}

export const deletePost = async (req, res) => {
    try {
      console.log(req.params.id)

      // Find post by ID
      const post = await Test.findById(req.params.id)

          // Check if post exists
    if (!post) {
      return res.status(404).send({ message: "Post not found" })
    }

    // Delete image from cloudinary if it exists
    if (post.cloudinaryId) {
      await cloudinary.uploader.destroy(post.cloudinaryId)
    }

    // Delete post from MDB
    await Test.deleteOne({ _id: req.params.id })

    res.status(200).send({ message: "Post deleted successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: "Error deleting post" })
  }
}
