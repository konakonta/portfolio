// Paper: desktop 1512×975, mobile 390×844. Each image has one fixed position per viewport.
// Highlighted images use the geometry of their own section, including in About.
export const BACKGROUND_LAYOUTS = {
  "reference": {
    "desktop": [1512, 975],
    "mobile": [390, 844]
  },
  "mobileBottomExtension": 94,
  "album": {
    "desktop": [359, 429, 133.70090550600605, 130.29451300903776, -8.77],
    "mobile": [8, 296, 90.3251338685533, 88.02981281965809, -8.77]
  },
  "images": [
    {
      "id": "portrait",
      "file": "background face.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [0, 0, 1512, 982, 0],
      "mobile": [-735, -24, 1480, 962, 0]
    },
    {
      "id": "blue-strip",
      "file": "background-1.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [119, 523, 1218, 93, 0],
      "mobile": [-194, 409, 768, 59, 0]
    },
    {
      "id": "cotton-top",
      "file": "sex-1.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [10, 625, 353, 118, 0],
      "mobile": [-26, 556, 223, 74, 0]
    },
    {
      "id": "car",
      "file": "original_car_with_flames_cutout.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [989, 710, 562, 355, 0],
      "mobile": [161, 586, 274, 173, 0]
    },
    {
      "id": "arch",
      "file": "background.png",
      "extendedFrom": [289, 221],
      "sourceSize": [296, 451],
      "revision": "20261020",
      "appearance": {"mobile": {"extended": false, "fit": "cover", "position": "50%"}},
      "fit": "contain",
      "position": "50% 0%",
      "desktop": [207, 693, 324, 292, 0],
      "mobile": [-33, 622, 274, 419, 0]
    },
    {
      "id": "blue-main",
      "file": "text blue main.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [898, 0, 516, 662, 0],
      "mobile": [206, 0, 268, 343, 0]
    },
    {
      "id": "blue-mark",
      "file": "blur background.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [1057, 298, 455, 172, 0],
      "mobile": [184, 286, 280, 106, 0]
    },
    {
      "id": "slot-back",
      "file": "casino for background.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [1141, 624, 311, 314, 0],
      "mobile": null
    },
    {
      "id": "slot",
      "file": "casino for projects.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [1131, 621, 321, 317, 0],
      "mobile": [238, 567, 157, 154, 0]
    },
    {
      "id": "camera",
      "file": "camera.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [728, 640, 524, 347, 0],
      "mobile": [18, 150, 226, 149, 0]
    },
    {
      "id": "blue-field",
      "file": "blue background.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [1064, 298, 448, 386, 0],
      "mobile": [225, 257, 171, 240, 0]
    },
    {
      "id": "goo",
      "file": "green goo.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [637, 726, 215, 203, 0],
      "mobile": null
    },
    {
      "id": "hand",
      "file": "hand.png",
      "extendedFrom": [230, 193],
      "sourceSize": [450, 631],
      "revision": "20261020",
      "appearance": {"mobile": {"extended": false, "fit": "97.343%", "position": "calc(3.5261253657618283px + 50%)"}},
      "fit": "contain",
      "position": "50% 100%",
      "desktop": [363, 673, 339, 288, 0],
      "mobile": [225.219, 615.191, 261.44774926847634, 356.7907219808265, 15]
    },
    {
      "id": "gun",
      "file": "gun.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [286, 662, 240, 226, 0],
      "mobile": [154, 671, 154.843, 145.658, -36.76]
    },
    {
      "id": "gun-text",
      "file": "text with gun.png",
      "fit": "cover",
      "position": "50%",
      "desktop": null,
      "mobile": null
    },
    {
      "id": "cotton-bottom",
      "file": "sex copy 2.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [0, 696, 353, 118, 0],
      "mobile": [-32, 601, 222, 74, 0]
    },
    {
      "id": "eye-stroke",
      "file": "text.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [97, 625, 62, 350, 0],
      "mobile": [29, 556, 39, 221, 0]
    },
    {
      "id": "eye-inside",
      "file": "inside eye.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [59, 789, 137, 49, 0],
      "mobile": [6, 659, 86, 32, 0]
    },
    {
      "id": "iris",
      "file": "iris.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [85, 763, 92, 74, 0],
      "mobile": [22, 643, 58, 47, 0]
    },
    {
      "id": "eye",
      "file": "eye.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [10, 763, 233, 107, 0],
      "mobile": [-26, 643, 148, 68, 0]
    },
    {
      "id": "sex",
      "file": "sex.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [85, 0, 326, 135, 0],
      "mobile": [24, 0, 204, 84, 0]
    },
    {
      "id": "spark",
      "file": "spark.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [-93, 61, 462, 397, 0],
      "mobile": [-77, 76, 278, 239, 0]
    },
    {
      "id": "photo",
      "file": "photo.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [404, 128, 278, 183, 0],
      "mobile": [93, 70, 179, 118, 0]
    },
    {
      "id": "back",
      "file": "back.png",
      "appearance": {"desktop": {"fit": "127.846%", "position": "0% 99.341%"}, "mobile": {"fit": "165.53%", "position": "1.734% 100%"}},
      "fit": "cover",
      "position": "50%",
      "desktop": [111, 311, 729, 939, 0],
      "mobile": [63, 261, 132, 235, 0]
    },
    {
      "id": "rampage",
      "file": "rampage.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [509, 285, 197, 108, 0],
      "mobile": [129, 261, 112, 61, 0]
    },
    {
      "id": "blue-second",
      "file": "text blue 2.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [473, 107, 291, 449, 0],
      "mobile": [117, 56, 189, 290, 0]
    },
    {
      "id": "green-slash",
      "file": "green slash.png",
      "fit": "cover",
      "position": "50%",
      "desktop": [349, 244, 127, 153, 0],
      "mobile": [107, 191, 83, 95, 0]
    }
  ],
  "foreground": {
    "desktop": {
      "recent": ["spark", "car", "slot"],
      "cinema": ["camera"],
      "music-video": ["sex", "eye-stroke", "eye-inside", "iris", "eye"],
      "commercials": ["photo", "gun", "gun-text"],
      "docs": ["hand"],
      "art": ["blue-main", "arch"]
    },
    "mobile": {
      "recent": ["spark", "car", "slot"],
      "cinema": ["camera"],
      "music-video": ["eye-stroke", "eye-inside", "iris", "eye", "sex"],
      "commercials": ["gun", "gun-text", "photo"],
      "docs": ["hand"],
      "art": ["blue-main", "arch"]
    }
  },
  "behindProjects": {
    "desktop": {
      "commercials": ["photo"]
    },
    "mobile": {
      "cinema": ["camera"]
    }
  },
  "order": {
    "desktop": ["portrait", "photo", "rampage", "blue-second", "back", "blue-strip", "cotton-top", "car", "arch", "blue-main", "blue-mark", "slot-back", "slot", "camera", "blue-field", "goo", "hand", "gun", "gun-text", "cotton-bottom", "eye-stroke", "eye-inside", "iris", "eye", "sex", "spark", "green-slash"],
    "mobile": ["portrait", "car", "slot", "gun", "hand", "arch", "photo", "blue-second", "sex", "blue-main", "cotton-top", "cotton-bottom", "eye-stroke", "eye-inside", "iris", "eye", "blue-mark", "blue-field", "camera", "rampage", "back", "blue-strip", "green-slash", "spark", "gun-text"]
  }
};
