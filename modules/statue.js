// statue.js
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { GUI } from "lil-gui";

// Store references to loaded statues for animation
export const statues = [];

export const loadStatueModel = (scene) => {
  const gltfLoader = new GLTFLoader();
  const gui = new GUI();

  // Model configurations with real-world scaling and positioning
  const modelConfigs = [
    {
      name: "Chateau Lion",
      path: "/models/statue/chateau_lion_gltf/scene.gltf",
      position: { x: -8, y: 0, z: -8 }, // Position above floor
      scale: 0.8, // Uniform scale
      rotation: { x: 0, y: Math.PI / 4, z: 0 },
      realWorldHeight: 1.8, // Approximate height in meters (lion statue)
      rotationSpeed: 0.5 // Rotation speed in radians per second
    },
    {
      name: "Girl with Doves",
      path: "/models/statue/girl_with_doves_gltf/scene.gltf",
      position: { x: 8, y: 0, z: -8 },
      scale: 1.0, // Base scale
      rotation: { x: 0, y: -Math.PI / 4, z: 0 },
      realWorldHeight: 1.6, // Approximate height in meters (human-sized statue)
      rotationSpeed: 0.3 // Rotation speed in radians per second
    }
  ];

  // Load each model
  modelConfigs.forEach((config) => {
    gltfLoader.load(config.path, (gltf) => {
      const statue = gltf.scene;
      
      // Calculate proper scale based on real-world dimensions
      const box = new THREE.Box3().setFromObject(statue);
      const size = box.getSize(new THREE.Vector3());
      const height = size.y;
      
      // Calculate scale factor to match real-world height
      const scaleFactor = (config.realWorldHeight / height) * config.scale;
      statue.scale.set(scaleFactor, scaleFactor, scaleFactor);
      
      // Recalculate bounding box after scaling
      box.setFromObject(statue);
      const newSize = box.getSize(new THREE.Vector3());
      
      // Position on floor (y = 0 is floor level)
      statue.position.set(
        config.position.x,
        newSize.y / 2, // Place bottom on floor
        config.position.z
      );
      
      statue.rotation.set(
        config.rotation.x,
        config.rotation.y,
        config.rotation.z
      );

      // Add shadows
      statue.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Store statue reference with config for animation
      const statueData = {
        object: statue,
        config: config,
        isRotating: true // Default to rotating
      };
      statues.push(statueData);

      scene.add(statue);

      // Add GUI controls
      const statueFolder = gui.addFolder(config.name);
      statueFolder.add(statue.position, "x", -15, 15).name("X Position");
      statueFolder.add(statue.position, "y", -1, 5).name("Y Position");
      statueFolder.add(statue.position, "z", -15, 15).name("Z Position");
      statueFolder.add(statue.scale, "x", 0.1, 3).name("X Scale").onChange(v => {
        statue.scale.y = v;
        statue.scale.z = v;
      });
      statueFolder.add(statue.rotation, "y", -Math.PI, Math.PI).name("Rotation");
      
      // Add rotation toggle control
      statueFolder.add(statueData, "isRotating").name("Auto Rotate");
      statueFolder.add(config, "rotationSpeed", 0, 2).name("Rotation Speed");

      console.log(`${config.name} loaded. Actual height: ${newSize.y.toFixed(2)} units`);
    }, 
    undefined, 
    (error) => {
      console.error(`Error loading ${config.name}:`, error);
    });
  });
};

// Function to update statue rotations
export const updateStatueRotations = (deltaTime) => {
  statues.forEach(statueData => {
    if (statueData.isRotating) {
      const rotationAmount = statueData.config.rotationSpeed * deltaTime;
      statueData.object.rotation.y += rotationAmount;
    }
  });
};