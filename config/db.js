require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = () => {
	mongoose.connect(
		process.env.DB_CONNECTION_URL,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
		},
		(err) => {
			if (err) throw err;
			console.log('Connected to mongodb');
		},
	);

	// const connection = mongoose.connection;

	// connection
	// 	.on('error', () => {
	// 		console.log('Error when connecting to db ');
	// 	})
	// 	.once('open', () => {
	// 		console.log('Successfully connected to database ');
	// 	});
};

module.exports = connectDB;
