const router = require('express').Router();

router.get('/', async (req, res) => {
    
    try {
      
        res.status(200).send('Deu bom!');
    }
    catch {
        res.sendStatus(500);
    }
});

module.exports = router;