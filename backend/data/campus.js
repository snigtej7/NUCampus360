// Campus data with 360° panoramic images
// Backend source of truth — served via /api/campus endpoint

const buildings = [
  {
    id: "event",
    name: "Event Space",
    type: "Event Space",
    color: "#CC0000",
    lat: 47.62413, lng: -122.33958,
    description: "Large open-plan gathering space on the ground floor west wing. Features flexible round tables, white chairs, a vibrant rainbow mural wall, and floor-to-ceiling glass overlooking the courtyard. Used for orientations, events, and student hangouts.",
    hours: "Mon–Fri: 7am–10pm | Sat–Sun: 9am–6pm",
    amenities: ["Flexible Round Tables", "Rainbow Mural", "Floor-to-Ceiling Glass", "AV Equipment", "Whiteboard Walls"],
    scenes: [
      { file: "tours/Event/event (1).jpg", label: "Main Floor", hfov: 110 },
      { file: "tours/Event/event (2).jpg", label: "Lounge Side", hfov: 110 },
      { file: "tours/Event/event (3).jpg", label: "Entry View", hfov: 110 }
    ]
  },
  {
    id: "dining",
    name: "Dining Area",
    type: "Dining",
    color: "#e07b39",
    lat: 47.62427, lng: -122.33927,
    description: "Campus dining area featuring a central kitchen island with red bar stools, communal white tables, a coffee station, and the iconic Northeastern Global world-map feature wall.",
    hours: "Mon–Fri: 8am–8pm | Sat: 10am–4pm | Sun: Closed",
    amenities: ["Kitchen Island", "Red Bar Stools", "Coffee Station", "World Map Wall", "Communal Tables"],
    scenes: [
      { file: "tours/Dining/dining (1).jpg", label: "Dining Area", hfov: 110 },
      { file: "tours/Dining/dining (2).jpg", label: "Husky Board", hfov: 110 },
      { file: "tours/Dining/dining (3).jpg", label: "Global Wall", hfov: 110 }
    ]
  },
  {
    id: "classrooms",
    name: "Classrooms",
    type: "Academic",
    color: "#3b82f6",
    lat: 47.62398, lng: -122.33918,
    description: "Modern classrooms with long rows of white desks, rolling chairs, multiple HD projector screens displaying Northeastern branding, and acoustic ceiling panels for hybrid-ready instruction.",
    hours: "Mon–Fri: 8am–10pm | Sat: 9am–6pm | Sun: Closed",
    amenities: ["Long Desk Rows", "Rolling Chairs", "Multiple HD Screens", "Acoustic Ceiling", "Hybrid Ready"],
    scenes: [
      { file: "tours/Classroom/classroom-1.jpg", label: "Full Room", hfov: 115 },
      { file: "tours/Classroom/classroom-2.jpg", label: "Side View", hfov: 115 },
      { file: "tours/Classroom/classroom 3.jpg", label: "Back View", hfov: 115 }
    ]
  },
  {
    id: "study",
    name: "Student Study Spaces",
    type: "Student Study",
    color: "#f59e0b",
    lat: 47.62431, lng: -122.33944,
    description: "Dedicated student study areas spanning multiple floors with individual work desks, wooden locker walls for storage, private phone booths for calls, and open corridors with natural light.",
    hours: "Mon–Fri: 7am–midnight | Sat–Sun: 9am–10pm",
    amenities: ["Individual Desks", "Locker Storage", "Phone Booths", "Open Corridors", "Natural Light"],
    scenes: [
      { file: "tours/Study/1st floor entrance.jpg", label: "Floor Entrance", hfov: 115 },
      { file: "tours/Study/study  (1).jpg", label: "Study Corridor", hfov: 115 },
      { file: "tours/Study/study  (2).jpg", label: "Corridor 2", hfov: 115 },
      { file: "tours/Study/study  (3).jpg", label: "Locker Wall", hfov: 115 }
    ]
  },
  {
    id: "lobby",
    name: "Main Lobby & Entrance",
    type: "Lobby / Entry",
    color: "#22c55e",
    lat: 47.62404, lng: -122.33960,
    description: "Striking main entrance with lime-green accent walls, wood-paneled elevator bays, live class schedule display screens on red accent walls, and views into the glass atrium courtyard.",
    hours: "Open 24/7 (card access required after 10pm)",
    amenities: ["24/7 Card Access", "Elevators", "Class Schedule Screen", "Red Accent Walls", "Courtyard Views"],
    scenes: [
      { file: "tours/Lobby/lobby-1.jpg", label: "Exterior / Courtyard", hfov: 110 },
      { file: "tours/Lobby/lobby-2.jpg", label: "Entrance Hall", hfov: 110 },
      { file: "tours/Lobby/lobby-3.jpg", label: "Schedule Screen", hfov: 110 },
      { file: "tours/Lobby/lobby-4.jpg", label: "Entry Seating", hfov: 110 }
    ]
  },
  {
    id: "staircase",
    name: "Staircase — Floors 1 to Roof",
    type: "Staircase",
    color: "#8b5cf6",
    lat: 47.62421, lng: -122.33908,
    description: "The Terry Thomas staircase with bold orange accent walls and energy-use infographic murals. Connects parking level P2 all the way up to roof access. Look for 'Stair 1 — P2 Thru Roof' signage.",
    hours: "Always accessible",
    amenities: ["P2 to Roof Access", "Orange Accent Walls", "Energy Infographics", "Card Access Roof", "Emergency Exit"],
    scenes: [
      { file: "tours/Staircase/staircase (1).jpg", label: "Floor 1 Entry", hfov: 115 },
      { file: "tours/Staircase/staircase-3.jpg", label: "Upper Floor", hfov: 115 }
    ]
  },
  {
    id: "lounge",
    name: "Upper Floor Lounge",
    type: "Student Lounge",
    color: "#06b6d4",
    lat: 47.62440, lng: -122.33933,
    description: "Elegant upper-floor lounge and corridor with large globe pendant lights, tropical plants, grey sofas with yellow cushions, and panoramic floor-to-ceiling windows overlooking South Lake Union.",
    hours: "Mon–Fri: 7am–midnight | Sat–Sun: 9am–10pm",
    amenities: ["Globe Pendant Lights", "Tropical Plants", "Grey Sofas", "City Views", "Quiet Zone"],
    scenes: [
      { file: "tours/Lounge/lounge (1).jpg", label: "Plant Corridor", hfov: 110 },
      { file: "tours/Lounge/lounge (2).jpg", label: "Corridor 2", hfov: 110 },
      { file: "tours/Lounge/lounge (3).jpg", label: "Corridor 3", hfov: 110 },
      { file: "tours/Lounge/lounge (4).jpg", label: "Wide View", hfov: 115 },
      { file: "tours/Lounge/lounge (5).jpg", label: "Lounge Area", hfov: 115 }
    ]
  },
  {
    id: "flexlab",
    name: "Flex Lab / Makerspace",
    type: "Innovation Lab",
    color: "#ec4899",
    lat: 47.62445, lng: -122.33950,
    description: "The Northeastern University Flex Lab — a hands-on makerspace with rolling butcher-block workbenches, a Toolboard wall of maker equipment, 3D printer filament spools, CNC tools, and open workstations for prototyping and fabrication.",
    hours: "Mon–Fri: 9am–9pm | Sat: 10am–5pm | Sun: Closed",
    amenities: ["Rolling Workbenches", "Toolboard Wall", "3D Printer Filament", "CNC Equipment", "Open Prototyping"],
    scenes: [
      { file: "tours/Flex Lab/flexlab-1.jpg", label: "Main Floor", hfov: 115 },
      { file: "tours/Flex Lab/flexlab-2.jpeg", label: "Workbenches", hfov: 115 }
    ]
  }
];

module.exports = { buildings };
