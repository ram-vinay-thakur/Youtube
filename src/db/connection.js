import mongoose from 'mongoose';
const connectDB = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGO_DB_COMPASS_URI}${process.env.DB_NAME}`, {
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
