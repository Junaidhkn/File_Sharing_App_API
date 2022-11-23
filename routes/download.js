const router = require( 'express' ).Router();
const File = require( '../Model/file' );
const path = require( 'path' );

router.get( '/:uuid', async ( req, res ) => {
	const file = await File.findOne( { uuid: req.params.uuid } );
	if ( !file ) return res.json( { error: 'File not found' } );

	const filepath = path.join( __dirname, '..', 'upload', file.filename );
	res.download( filepath );
} );

module.exports = router;
