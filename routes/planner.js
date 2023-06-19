const express = require('express')
const router = express.Router()
const Plant = require('../models/plantPlanner')

//Getting all plants by name
router.get('/', async (req,res) => {
    try{
        const plants = await Plant.find({},"name")
        res.json(plants)
    } catch (err){
        res.status(500).json({message: err.message})
    }
})

//Get the name, species, and cultivar of plant by ID
router.get('/:id',getPlant, async (req,res) =>{
    try{
        const search = await Plant.findById(req.params.id).select('name species cultivar')
        res.json(search)
    } catch(err){ 
        res.status(500).json({message: err.message})
    }
})

//Create / register a new plant
router.post('/', async (req,res) => {
    const plant = new Plant({
        name: req.body.name,
        species : req.body.species,
        cultivar : req.body.cultivar
    })
    try{
        const newPlant = await plant.save()
        res.status(201).json(newPlant)
    } catch(err) {
        res.status(400).json({message: err.message})
    }
})

//Update a plant. rename a plant ONLY
router.put('/:id', getPlant,  async(req,res)=> {
    const checkPlant = await (Plant.findById(req.params.id).select('isAlive'))
    if(checkPlant.isAlive){
        try{
            const plantQuery = await Plant.findByIdAndUpdate({ _id : req.params.id}, { name : req.body.name}, {new: true})
            res.json(plantQuery)
        } catch(err) {
            res.status(400).json({message:err.message})
        }
    }else {
        res.json({message: 'plant is dead'})
    }
})

//mark as dead
//change to one endpoint, maybe change to put
router.patch('/:id/dead', async(req,res) => {
    try{
        const plantQuery = await Plant.updateOne({ _id : req.params.id},{$set: { isAlive : false}})
        res.json(plantQuery)
    } catch(err) {
        res.status(400).json({message:err.message})
    }  
})

//mark as alive * for testning*
router.patch('/:id/alive', async(req,res) => {
    try{
        const plantQuery = await Plant.updateOne({ _id : req.params.id},{$set: { isAlive : true}})
        res.json(plantQuery)
    } catch(err) {
        res.status(400).json({message:err.message})
    }  
})

// Delete a plant
router.delete('/:id',getPlant, async (req,res)=> {
    try{
        const removedPlant= await Plant.findByIdAndDelete(req.params.id)
        res.json({message: `${removedPlant.name} was removed`})
    } catch(err){
        res.json({message:err.message})
    }
})

//register an event for a plant
router.post('/:id/event', async (req,res) => {
    const checkPlant = await (Plant.findById(req.params.id).select('isAlive'))
    if(checkPlant.isAlive){
        try{
            const plantQuery = await Plant.findById(req.params.id)
            if (!plantQuery) {
                res.status(400).json({message: "Plant not found"})
            }
            const {date, eventType, description} = req.body
            plantQuery.Event.push({date, eventType, description})
            await plantQuery.save()
            res.status(201).json(plantQuery.Event[plantQuery.Event.length + 1])
        } catch(err) {
            return res.status(500).json({message: err.message})
        }
    } else {
        res.json({message: 'plant is dead'})
    }

})

//Get events for plant between a certain time (?)
router.get('/:id/event', async (req,res)=>{
    const { start, end } = req.query;
    const startDate = new Date(start);
    const endDate = new Date(end);
  
    try {
      const returnedQuery = await Plant.findById(req.params.id);
      const event = returnedQuery.Event;
      const filteredEvents = event.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startDate && eventDate <= endDate;
      });
      res.json(filteredEvents);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
})


//delete an event 
router.delete('/:id/event/:eventid',getPlant, async (req,res)=> {
    try{
        const {id, eventid} = req.params
        const removedEvent= await Plant.findByIdAndUpdate( id, {$pull: { Event : { _id :eventid.replace(/\n/g,'')}}}, {new : true})
        res.json({message: `${removedEvent}event was removed`})
    } catch(err){
        res.json({message:err.message})
    }
})

//register a harvest for a plant
router.post('/:id/harvest', async (req,res) => {
    const checkPlant = await (Plant.findById(req.params.id).select('isAlive'))
    if(checkPlant.isAlive){
        try{
            const plantQuery = await Plant.findById(req.params.id)
            if (!plantQuery) {
                res.status(400).json({message: "Plant not found"})
            }
            const {date, weight, quantity} = req.body
            plantQuery.Harvest.push({date, weight, quantity})
            await plantQuery.save()
            res.status(201).json(plantQuery.Harvest[plantQuery.Harvest.length + 1])
        } catch(err) {
            return res.status(500).json({message: err.message})
        }
    } else {
        res.json({message: 'plant is dead'})
    }

})

//get the list of harvests for a particular plant
router.get('/:id/harvest', async (req,res) =>{
    try{
        const harvest = await Plant.findById(req.params.id)
        res.json(harvest.Harvest)
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
})

//get the list of harvests for a particular day
router.get('/harvest/:date', async (req,res) =>{
    try{
        const harvests = await Plant.find({Harvest : {$elemMatch: { date: req.params.date }}})
        res.json(harvests)
    } catch (err){ 
        return res.status(500).json({message: err.message})
    }
})

async function getPlant(req,res,next){
    let plant
    try{
        plant = await Plant.findById(req.params.id)
        if(plant == null){
            return res.status(404).json({message: 'Cannot find plant'})
        }
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
    res.plant = plant
    next()
}

module.exports = router