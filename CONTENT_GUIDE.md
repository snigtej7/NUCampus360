# NUCampus360 — Content Update Guide
### For university staff: how to update the app without writing code

This guide is for anyone at Northeastern Seattle who needs to update building hours, add new spaces, or change contact info. You only need to edit **one file**.

---

## The only file you need to touch

```
backend/data/campus.js
```

This file contains all building information. Every change you make here automatically appears in the app and in the AI guide's responses.

---

## How to edit it

### Option A — Edit directly on GitHub (easiest, no software needed)

1. Go to your GitHub repository
2. Navigate to `backend/data/campus.js`
3. Click the **pencil icon** (✏️) in the top-right corner of the file
4. Make your changes
5. Scroll down → click **Commit changes**
6. The app updates automatically within ~3 minutes

### Option B — Edit locally with VS Code

1. Open the project in VS Code
2. Open `backend/data/campus.js`
3. Make changes, save
4. Run `git add . && git commit -m "Update building hours" && git push`

---

## Building entry structure

Each building looks like this:

```js
{
  id: "library",                          // Never change this — it's an internal ID
  name: "Snell Library Annex",            // ← Building display name
  type: "Academic",                       // Academic | Student Services | Research | Recreation
  color: "#CC0000",                       // Marker color (leave as-is)
  lat: 47.6215,                           // GPS latitude  ← update with real coords
  lng: -122.3480,                         // GPS longitude ← update with real coords
  description: "Seattle branch of...",   // ← 1-2 sentence description shown in popup
  hours: "Mon–Thu: 8am–11pm | ...",       // ← Operating hours
  spaces: ["Study Pods", "Group Rooms"],  // ← Rooms/areas inside this building
  tourImages: [],                         // ← Leave empty or add panorama URLs (see below)
  contact: "library.seattle@northeastern.edu",  // ← Email shown in tour panel
  amenities: ["Quiet Zones", "Printing"] // ← Bullet-point amenities
}
```

---

## Common updates

### Change building hours

Find the building, update the `hours` field:

```js
// Before
hours: "Mon–Thu: 8am–11pm | Fri: 8am–8pm | Sat–Sun: 10am–8pm",

// After (e.g. extended summer hours)
hours: "Mon–Fri: 8am–midnight | Sat–Sun: 10am–10pm",
```

### Add a new space to a building

```js
// Before
spaces: ["Study Pods", "Group Rooms", "Reference Desk"],

// After
spaces: ["Study Pods", "Group Rooms", "Reference Desk", "New Grad Student Lounge"],
```

### Add a new building

Copy an existing building block, paste it at the end of the array (before the final `]`), and update all the fields. Make sure the `id` is unique (no spaces, all lowercase, use hyphens).

```js
  {
    id: "innovation-hub",
    name: "Innovation Hub",
    type: "Research",
    color: "#3b82f6",
    lat: 47.6230,
    lng: -122.3515,
    description: "New collaborative space for student startups and industry partners.",
    hours: "Mon–Fri: 9am–8pm | Sat: 10am–4pm | Sun: Closed",
    spaces: ["Hot Desks", "Meeting Rooms", "Pitch Room"],
    tourImages: [],
    contact: "innovationhub@northeastern.edu",
    amenities: ["Standing Desks", "High-Speed WiFi", "Espresso Bar"]
  }
```

### Add 360° photos to a building

Add your Cloudinary image URLs to the `tourImages` array:

```js
tourImages: [
  "https://res.cloudinary.com/nuseattle/image/upload/library_lobby_360.jpg",
  "https://res.cloudinary.com/nuseattle/image/upload/library_reading_room_360.jpg"
],
```

---

## Updating the AI guide's knowledge

The AI (Husky) answers questions using a knowledge document in:

```
backend/server.js
```

Look for the `CAMPUS_CONTEXT` variable — it's a large text block that lists all the campus facts Husky knows. Update it the same way you update `campus.js`:

- Add new FAQ answers
- Update hours
- Add new programs
- Add transportation info

The AI automatically uses whatever is in that text block.

---

## How to find exact GPS coordinates

1. Open **Google Maps** in a browser
2. Find the building on the map
3. Right-click exactly on the building entrance
4. Click the coordinates at the top of the menu (this copies them)
5. Paste into `lat` and `lng` in campus.js (note: lat comes first, then lng)

---

## Questions?

Contact the NUCampus360 development team or open an issue on GitHub.
