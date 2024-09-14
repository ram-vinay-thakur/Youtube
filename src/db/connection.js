import mongoose from 'mongoose';
const connectDB = async () => {
    try {
        const connection = await mongoose.connect(`mongodb+srv://devraj:${process.env.MONGO_PASSWORD}@${process.env.DB_NAME}.w2u9n.mongodb.net/`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`\nMongoDB Connected! DB Host: ${connection.connection.host}`);
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};

connectDB();

export default connectDB;
