import mongoose, {Schema} from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        imageLink: {
            type: String, //cloudinary url
            required: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "Admin" //this will show us which admin created the course.
        }
    },
    {
        timestamps: true
    }
)

export const Course = mongoose.model("Course", courseSchema)