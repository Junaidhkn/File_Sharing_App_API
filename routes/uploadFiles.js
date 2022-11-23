const express = require( 'express' );
const multer = require( 'multer' );
const path = require( 'path' );
const File = require( '../Model/file' );
const { v4: uuid4 } = require( 'uuid' );
const sendEmail = require( '../services/emailService' );

const router = express.Router();

let storage = multer.diskStorage( {
	destination: ( req, file, cb ) => {
		cb( null, 'upload/' );
	},
	filename: ( req, file, cb ) => {
		const uniqueName = `${Date.now()}-${Math.round(
			Math.random() * 1e5,
		)}${path.extname( file.originalname )}`;
		cb( null, uniqueName );
	},
} );

const upload = multer( {
	storage,
	limits: { fileSize: 1e7 },
} ).single( 'file' );

router.post( '/', ( req, res ) => {
	upload( req, res, async ( err ) => {
		if ( err ) {
			return res.status( 500 ).send( { error: err.message } );
		}
		const file = new File( {
			filename: req.file.filename,
			uuid: uuidv4(),
			path: req.file.path,
			size: req.file.size
		} );
		const response = await file.save();
		res.json( { file: `${process.env.APP_BASE_URL}/files/${response.uuid}` } );
	} );
} );

router.post( '/send', async ( req, res ) => {
	const { uuid, emailTo, emailFrom, title, description } = req.body;

	if ( !uuid || !emailTo || !emailFrom ) {
		return res.status( 400 ).json( { error: 'All fields are required.' } );
	}

	const file = await File.findOne( { uuid: uuid } );
	if ( !file ) {
		return res.status( 400 ).json( { error: 'File not found.' } );
	}
	file.sender = emailFrom;
	file.receiver = emailTo;
	file.title = title;
	file.description = description;

	const response = await file.save();

	// Send Email
	sendEmail( {
		to: emailTo,
		from: emailFrom,
		Subject: title,
		description: description,
		html: require( '../services/emailTemplate' )( {
			emailFrom: emailFrom,
			Subject: title,
			description: description,
			downloadLink: `${process.env.APP_URL}/files/download/${file.uuid}`,
			size: parseInt( file.size / 1000 ) + ' KB',
			expires: '24 hours',
		} ),
	} );
	return res.send( { success: true } );
} );


router.post( '/send', async ( req, res ) => {
	const { uuid, emailTo, emailFrom, title, description } = req.body;
	if ( !uuid || !emailTo || !emailFrom ) {
		return res.status( 422 ).send( { error: 'All fields are required!' } );
	}
	// Get data from db 
	try {
		const file = await File.findOne( { uuid: uuid } );
		if ( file.sender ) {
			return res.status( 422 ).send( { error: 'Email already sent once.' } );
		}
		file.sender = emailFrom;
		file.receiver = emailTo;
		const response = await file.save();
		// send mail
		const sendMail = require( '../services/emailService.js' );
		sendMail( {
			from: emailFrom,
			to: emailTo,
			subject: title,
			text: `${emailFrom} shared a file with you.\n ${description}`,
			html: require( '../services/emailTemplate.js' )( {
				emailFrom,
				downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email`,
				size: parseInt( file.size / 1000 ) + ' KB',
				expires: '24 hours'
			} )
		} ).then( () => {
			return res.json( { success: true } );
		} ).catch( err => {
			return res.status( 500 ).json( { error: 'Error in email sending.' } );
		} );
	} catch ( err ) {
		return res.status( 500 ).send( { error: 'Something went wrong.' } );
	}

} );



module.exports = router;
