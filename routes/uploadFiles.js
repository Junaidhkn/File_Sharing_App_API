const express = require( 'express' );
const multer = require( 'multer' );
const path = require( 'path' );
const File = require( '../Model/file' );
const { v4: uuid4 } = require( 'uuid' );
const sendEmail = require( '../services/emailService' );

const router = express.Router();

let storage = multer.diskStorage( {
	destination: ( req, file, cb ) => cb( null, 'upload/' ),
	filename: ( req, file, cb ) => {
		const uniqueName = `${Date.now()}-${Math.round( Math.random() * 1E9 )}${path.extname( file.originalname )}`;
		cb( null, uniqueName )
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
			uuid: uuid4(),
			path: req.file.path,
			size: req.file.size
		} );
		const response = await file.save();
		res.json( { file: `${process.env.APP_BASE_URL}/files/${response.uuid}`, id: response.uuid, name: response.filename, size: response.size } );
	} );
} );



router.post( '/send', async ( req, res ) => {
	const { uuid, emailto, emailfrom, title, description } = req.body;
	if ( !uuid || !emailto || !emailfrom ) {
		return res.status( 422 ).send( { error: 'All fields are required!' } );
	}
	// Get data from db 
	try {
		const file = await File.findOne( { uuid: uuid } );
		// if ( file.sender ) {
		// 	return res.status( 422 ).send( { error: 'Email already sent once.' } );
		// }
		file.sender = emailfrom;
		file.receiver = emailto;
		const response = await file.save();
		// send mail
		const sendMail = require( '../services/emailService.js' );
		sendMail( {
			from: emailfrom,
			to: emailto,
			subject: title,
			text: `${emailfrom} shared a file with you.\n ${description}`,
			html: require( '../services/emailTemplate.js' )( {
				emailfrom,
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
