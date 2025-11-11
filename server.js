const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Joi = require("joi");
const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./public/images/");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });
  
  const upload = multer({ storage: storage });

let houses = [
    {
        "_id":0,
        "name": "Farmhouse",
        "size": 2000,
        "bedrooms": 3,
        "bathrooms": 2.5,
        "features": [
            "wrap around porch",
            "attached garage"
        ],
        "main_image": "farm.webp",
        "floor_plans": [
            {
                "name": "Main Level",
                "image": "farm-floor1.webp"
            },
            {
                "name": "Basement",
                "image": "farm-floor2.webp"
            }
        ]
    },
    {
        "_id":1,
        "name": "Mountain House",
        "size": 1700,
        "bedrooms": 3,
        "bathrooms": 2,
        "features": [
            "grand porch",
            "covered deck"
        ],
        "main_image": "mountain-house.webp",
        "floor_plans": [
            {
                "name": "Main Level",
                "image": "mountain-house1.webp"
            },
            {
                "name": "Optional Lower Level",
                "image": "mountain-house2.webp"
            },
            {
                "name": "Main Level Slab Option",
                "image": "mountain-house3.jpg"
            }
        ]
    },
    {
        "_id":2,
        "name": "Lake House",
        "size": 3000,
        "bedrooms": 4,
        "bathrooms": 3,
        "features": [
            "covered deck",
            "outdoor kitchen",
            "pool house"
        ],
        "main_image": "farm.webp",
        "floor_plans": [
            {
                "name": "Main Level",
                "image": "lake-house1.webp"
            },
            {
                "name": "Lower Level",
                "image": "lake-house2.webp"
            }
        ]
    }
];

app.get("/api/houses/", (req, res)=>{
    res.send(houses);
});

app.get("/api/houses/:id", (req, res)=>{
    const house = houses.find((house)=>house._id === parseInt(req.params.id));
    res.send(house);
});

app.post("/api/houses", upload.single("img"), (req,res)=>{
    console.log("in post request");
const result = validateHouse(req.body);


if(result.error){
    console.log("I have an error", result.error.details[0].message);
    res.status(400).send(result.error.details[0].message);
    return;
}

    const house = {
        _id: houses.length,
        name:req.body.name,
        size:Number(req.body.size),
        bedrooms:Number(req.body.bedrooms),
        bathrooms:Number(req.body.bathrooms),
        features: [],
    };

if (req.body.features) {
    house.features = Array.isArray(req.body.features)
        ? req.body.features
        : req.body.features.split(",").map((feature) => feature.trim()).filter(Boolean);
}

if (req.body.main_image && !req.file) {
    house.main_image = req.body.main_image;
}

    //adding image
    if(req.file){
        house.main_image = req.file.filename;
    }

    houses.push(house);
    res.status(200).send(house);
});

const validateHouse = (house) => {
    const schema = Joi.object({
        _id:Joi.allow(""),
        name:Joi.string().min(3).required(),
        size:Joi.number().required().min(0),
        bedrooms:Joi.number().required().min(0),
        bathrooms:Joi.number().required().min(0),
        features: Joi.alternatives().try(
            Joi.array().items(Joi.string()),
            Joi.string()
        ).optional(),
        main_image: Joi.string().optional()
    }).options({ allowUnknown: true });

    return schema.validate(house);
};

app.listen(3001, () => {
    console.log("Server is up and running");
});