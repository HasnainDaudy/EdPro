import { getDatabase, executeBatch, execute } from './database.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function runSeed(): Promise<void> {
  console.log('Initializing EdPro database schema...');
  const schemaPath = path.resolve(process.cwd(), 'src/server/db/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  await executeBatch(schemaSql);
  console.log('Schema successfully applied.');

  const db = await getDatabase();

  // Check if users already seeded
  const existingUsers = db.exec('SELECT COUNT(*) as count FROM users');
  const userCount = existingUsers[0]?.values[0]?.[0] as number;

  if (userCount > 0) {
    console.log(`Database already has ${userCount} users. Re-seeding clean demo dataset...`);
    await executeBatch(`
      DELETE FROM student_submissions;
      DELETE FROM student_progress;
      DELETE FROM milestone_assessments;
      DELETE FROM lessons;
      DELETE FROM courses;
      DELETE FROM student_privacy_records;
      DELETE FROM audit_logs;
      DELETE FROM users;
    `);
  }

  console.log('Creating demo users (Admin, Teachers, Students)...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('EdProPass123!', salt);

  const adminId = uuidv4();
  const teacherId = uuidv4();
  const studentLeoId = uuidv4();
  const studentMayaId = uuidv4();
  const studentSamId = uuidv4();

  const now = new Date().toISOString();

  // 1. Admin
  await execute(
    `INSERT INTO users (id, username, password_hash, role, display_name, age, age_track, passion_track, focus_art_ratio, focus_math_ratio, avatar_seed, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [adminId, 'admin', passwordHash, 'ADMIN', 'District Administrator', 42, 'high_school_14_17', 'curriculum', 50, 50, 'admin_shield', now]
  );

  // 2. Teacher
  await execute(
    `INSERT INTO users (id, username, password_hash, role, display_name, age, age_track, passion_track, focus_art_ratio, focus_math_ratio, avatar_seed, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [teacherId, 'teacher_carter', passwordHash, 'TEACHER', 'Ms. Clara Carter', 34, 'middle_school_10_13', 'visual_arts', 70, 30, 'teacher_carter', now]
  );

  // 3. Student Leo (Loves Arts, Struggles with Algebra)
  await execute(
    `INSERT INTO users (id, username, password_hash, role, display_name, age, age_track, passion_track, focus_art_ratio, focus_math_ratio, avatar_seed, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [studentLeoId, 'leo_artist', passwordHash, 'STUDENT', 'Leo Chen', 11, 'middle_school_10_13', 'visual_arts', 85, 15, 'leo_palette', now]
  );

  // 4. Student Maya (Loves Game Design & Coding)
  await execute(
    `INSERT INTO users (id, username, password_hash, role, display_name, age, age_track, passion_track, focus_art_ratio, focus_math_ratio, avatar_seed, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [studentMayaId, 'maya_games', passwordHash, 'STUDENT', 'Maya Rodriguez', 12, 'middle_school_10_13', 'game_design', 30, 70, 'maya_controller', now]
  );

  // 5. Student Sam (Early childhood music explorer)
  await execute(
    `INSERT INTO users (id, username, password_hash, role, display_name, age, age_track, passion_track, focus_art_ratio, focus_math_ratio, avatar_seed, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [studentSamId, 'sam_beats', passwordHash, 'STUDENT', 'Sam Taylor', 8, 'early_childhood_6_9', 'music_production', 60, 40, 'sam_headphones', now]
  );

  // COPPA privacy records for minors under 13
  const coppaStudents = [studentLeoId, studentMayaId, studentSamId];
  const expiresAt = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString();

  for (const sId of coppaStudents) {
    await execute(
      `INSERT INTO student_privacy_records (id, student_id, coppa_covered, consent_status, authorized_by_user_id, authorized_at, retention_expires_at, created_at)
       VALUES (?, ?, 1, 'SCHOOL_AUTHORIZED', ?, ?, ?, ?)`,
      [uuidv4(), sId, teacherId, now, expiresAt, now]
    );
  }

  console.log('Seeding courses with the 6+1 Unit Architecture...');

  // Course 1: Visual Arts & Geometry
  const course1Id = uuidv4();
  await execute(
    `INSERT INTO courses (id, title, slug, description, age_track, passion_cluster, icon_name, badge_color, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      course1Id,
      'Visual Arts, Color Harmonies & Geometric Proportions',
      'visual-arts-geometry',
      'Learn geometry, ratios, and spatial balance through master painting techniques, color wheels, and architectural tessellations.',
      'middle_school_10_13',
      'Visual Arts',
      'Palette',
      '#EC4899',
      now
    ]
  );

  // 6 Lessons for Course 1
  const course1Lessons = [
    {
      num: 1,
      title: "The Spark: The Hidden Geometry in Leonardo's Sketches",
      duration: 15,
      hook: "Did Leonardo da Vinci paint with intuition, or did he hide secret geometric grids beneath the Mona Lisa?",
      objective: "Identify geometric underlying structures in visual compositions.",
      concepts: ["Geometric Scaffolding", "Focal Points", "Visual Weight"],
      vocab: ["Composition", "Axis", "Proportion", "Focal Point"],
      analogies: ["A skeleton inside an animal that gives it form without being seen"],
      reader: `### Welcome to Visual Geometry!
Great artists don't just put paint on canvas randomly—they use an invisible scaffold called **compositional geometry**. 
When Renaissance masters like Leonardo da Vinci or Michelangelo designed masterpieces, they started with triangles, golden spirals, and balanced symmetry.

By understanding how shapes balance visual weight, you can guide the viewer's eyes directly to where you want them to look!`,
      simType: 'color_wheel',
      simConfig: { mode: 'proportions', defaultColor: '#6366F1' },
      pulse: {
        question: 'Why do painters use geometric triangles in their background grids?',
        options: [
          'Because canvas fabric only comes in triangle shapes',
          'To create visual stability and naturally guide the eye to the focal point',
          'To save paint by avoiding round curves',
          'Because circles were banned during the Renaissance'
        ],
        correctIndex: 1,
        hint: 'Think about how a pyramid stands firm without tipping over!'
      }
    },
    {
      num: 2,
      title: 'The 12-Tone Color Wheel & Primary Pigments',
      duration: 18,
      hook: 'Can just three pure colors create every single shade in the universe?',
      objective: 'Master primary, secondary, and tertiary color mixing physics.',
      concepts: ['Primary Hues', 'Secondary Blends', 'Tertiary Transitions'],
      vocab: ['Hue', 'Saturation', 'Pigment', 'Chroma'],
      analogies: ['Cooking ingredients: Red, Blue, and Yellow are the base flour and water'],
      reader: `### The Color Wheel Architecture
The color wheel is not just an artist's toy; it's a map of optical physics. 
- **Primary Colors**: Red, Yellow, Blue (pure wavelengths that cannot be created by mixing other pigments).
- **Secondary Colors**: Orange, Green, Purple (formed by combining pairs of primaries at 50/50 ratio).
- **Tertiary Colors**: Red-Orange, Yellow-Green, Blue-Violet (the delicate bridges in between).`,
      simType: 'color_wheel',
      simConfig: { mode: 'wheel_explorer', defaultColor: '#F59E0B' },
      pulse: {
        question: 'What color emerges when equal amounts of Cyan/Blue and Yellow are combined?',
        options: ['Purple', 'Green', 'Brown', 'Magenta'],
        correctIndex: 1,
        hint: 'Think of mixing blue sky and golden sunlight on freshly sprouted grass!'
      }
    },
    {
      num: 3,
      title: 'Complementary Harmonies & The Interactive Wheel',
      duration: 20,
      hook: 'Why do movie posters always combine Teal and Orange?',
      objective: 'Calculate optical color contrast and utilize opposite pairings on the wheel.',
      concepts: ['Complementary Opposites', 'Simultaneous Contrast', 'Vibrancy'],
      vocab: ['Complementary', 'Hex Code', 'Optical Contrast', 'Harmony'],
      analogies: ['Magnets with north and south poles snapping attention together'],
      reader: `### The Power of Opposites
Look straight across the 360-degree color wheel:
- Blue sits directly across from Orange (180° offset).
- Red sits opposite from Green.
- Yellow sits opposite from Purple.

When placed side-by-side, complementary colors make each other look dramatically more vibrant! In this lesson, test out the interactive color wheel below.`,
      simType: 'color_wheel',
      simConfig: { mode: 'complementary_finder', defaultColor: '#06B6D4' },
      pulse: {
        question: 'If an artist paints a glowing yellow sun, what complementary color in the shadows will make the sun pop the most?',
        options: ['Bright Orange', 'Pale Yellow', 'Deep Purple/Violet', 'White'],
        correctIndex: 2,
        hint: 'Find the color directly across (180 degrees) from Yellow on the color wheel!'
      }
    },
    {
      num: 4,
      title: 'Tessellations & Symmetry: Islamic Tile Geometry',
      duration: 22,
      hook: 'How did ancient architects cover miles of palace walls with interlocking tiles without leaving a single gap?',
      objective: 'Apply geometric translations, rotations, and reflections to create seamless repeating patterns.',
      concepts: ['Regular Tessellation', 'Rotational Symmetry', 'Interlocking Tiles'],
      vocab: ['Tessellation', 'Vertex', 'Polygon', 'Glide Reflection'],
      analogies: ['A puzzle where every piece is identical yet fits together endlessly'],
      reader: `### The Sacred Math of Repeating Patterns
In Alhambra and historic mosques, geometric tessellations turn walls into infinite tapestries of harmony.
A **tessellation** occurs when shapes repeat without overlapping and without any empty gaps. 
Notice: triangles ($60^\\circ$), squares ($90^\\circ$), and hexagons ($120^\\circ$) tessellate seamlessly because their interior angles divide $360^\\circ$ evenly!`,
      simType: 'color_wheel',
      simConfig: { mode: 'tessellation_preview', defaultColor: '#10B981' },
      pulse: {
        question: 'Why does a regular regular pentagon (5 sides, 108° angles) NOT tessellate smoothly alone on a flat surface?',
        options: [
          'Because 5-sided shapes are too heavy for mortar',
          'Because 108° cannot divide 360° evenly, leaving awkward gaps',
          'Because pentagons can only be drawn with digital software',
          'Because pentagons always turn into circles'
        ],
        correctIndex: 1,
        hint: 'Three pentagons meet at 3 x 108° = 324°, leaving a 36° gap where tiles cannot meet!'
      }
    },
    {
      num: 5,
      title: 'Perspective & Vanishing Points: Depth Without Fear',
      duration: 20,
      hook: 'How do you turn a flat sheet of paper into a hallway that looks like you can walk straight into it?',
      objective: 'Construct single and two-point linear perspective grids.',
      concepts: ['Horizon Line', 'Vanishing Point', 'Orthogonal Lines'],
      vocab: ['Perspective', 'Horizon', 'Vanishing Point', 'Convergence'],
      analogies: ['Train tracks converging together into a single distant speck on the horizon'],
      reader: `### Linear Perspective Demystified
Until the early 1400s, paintings looked flat—people in the background were drawn the same size as people in the front!
Then Brunelleschi discovered linear perspective:
1. Establish the **Horizon Line** (the viewer's eye level).
2. Mark the **Vanishing Point** where all parallel lines converge.
3. Draw diagonal **orthogonal lines** connecting edges back to that point. Everything shrinks smoothly as it approaches distance.`,
      simType: 'color_wheel',
      simConfig: { mode: 'perspective_grid', defaultColor: '#8B5CF6' },
      pulse: {
        question: 'When drawing a road receding into the distance, what happens to the spacing between telephone poles?',
        options: [
          'They stay exactly the same distance apart',
          'They get progressively closer together as they approach the vanishing point',
          'They get farther apart',
          'They turn into horizontal lines'
        ],
        correctIndex: 1,
        hint: 'Objects appear both smaller and compressed closer together as distance increases.'
      }
    },
    {
      num: 6,
      title: 'Synthesis: Creating Your Masterpiece Blueprint',
      duration: 25,
      hook: "You now possess all five secret weapons of the studio artist. Let's unite them into a portfolio piece!",
      objective: 'Synthesize color harmony, perspective, and balance into a cohesive final creative project.',
      concepts: ['Curatorial Synthesis', 'Color Story', 'Portfolio Critique'],
      vocab: ['Synthesis', 'Critique', 'Rubric', 'Iteration'],
      analogies: ['Conducting an orchestra where color, shape, and depth play in unison'],
      reader: `### From Practice to Portfolio
You have explored:
- Hidden structural geometry
- Color physics and 12-tone harmonies
- Complementary contrast dynamics
- Symmetrical tessellations
- Linear perspective depth

In the upcoming Milestone 7 Assessment, you will take an interactive 6-question challenge and submit your own creative composition!`,
      simType: 'color_wheel',
      simConfig: { mode: 'masterpiece_builder', defaultColor: '#F43F5E' },
      pulse: {
        question: 'Which element is most essential when establishing the mood or emotional tone of your final piece?',
        options: [
          'The brand of pencil you use',
          'The deliberate color temperature harmony (warm vs. cool) and focal hierarchy',
          'Drawing as many objects as possible on the canvas',
          'Signing your name in the center'
        ],
        correctIndex: 1,
        hint: 'Color temperature (warm fires vs. cool depths) instantly activates the viewer’s emotional centers.'
      }
    }
  ];

  for (const l of course1Lessons) {
    await execute(
      `INSERT INTO lessons (
        id, course_id, lesson_number, title, duration_minutes, spark_hook, objective,
        key_concepts_json, allowed_vocab_json, analogies_json, reader_content,
        video_url, video_title, simulation_type, simulation_config_json,
        audio_summary_text, worksheet_title, worksheet_markdown, pulse_question_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        course1Id,
        l.num,
        l.title,
        l.duration,
        l.hook,
        l.objective,
        JSON.stringify(l.concepts),
        JSON.stringify(l.vocab),
        JSON.stringify(l.analogies),
        l.reader,
        'https://www.youtube-nocookie.com/embed/Qj1FK8n7WgY',
        `Video Masterclass: ${l.title}`,
        l.simType,
        JSON.stringify(l.simConfig),
        `Listen to Nova's 2-minute audio breakdown of ${l.title}. Learn how colors, balance, and proportions unite!`,
        `Practice Activity: ${l.title}`,
        `# Studio Sketch Sheet\n\n1. Sketch 3 different thumbnail compositions using the concepts from ${l.title}.\n2. Mark your primary focal point with a star.\n3. Note the complementary colors you chose.`,
        JSON.stringify(l.pulse)
      ]
    );
  }

  // Milestone 7 Assessment for Course 1
  const assessment1Id = uuidv4();
  await execute(
    `INSERT INTO milestone_assessments (id, course_id, title, description, passing_score, questions_json, performance_task_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      assessment1Id,
      course1Id,
      'Milestone 7 Assessment: Visual Arts & Geometry Portfolio',
      'Test your mastery across the 6 lessons, followed by an authentic creative studio submission for teacher review.',
      70,
      JSON.stringify([
        {
          id: 'q1',
          prompt: 'Which pair of colors are true complementary opposites on the 12-tone color wheel?',
          options: ['Blue and Orange', 'Red and Purple', 'Yellow and Green', 'Blue and Green'],
          correctIndex: 0,
          diagnosticHint: 'Think about which two colors sit directly 180 degrees opposite each other across the wheel.'
        },
        {
          id: 'q2',
          prompt: 'What mathematical reason explains why equilateral triangles tessellate perfectly on a 2D surface?',
          options: [
            'Each corner has an angle of 60°, and 6 of them meet exactly at 360°',
            'Triangles have no angles at all',
            'Because three triangles always form a pentagon',
            'They only tessellate when drawn with black ink'
          ],
          correctIndex: 0,
          diagnosticHint: 'A full circle around any junction point is 360 degrees. 6 times 60 is 360!'
        },
        {
          id: 'q3',
          prompt: 'In single-point linear perspective, where do all horizontal parallel lines receding away from the viewer meet?',
          options: ['At the bottom border', 'At the Vanishing Point on the Horizon Line', 'At the top corner of the frame', 'They never meet'],
          correctIndex: 1,
          diagnosticHint: 'Remember the speck where railroad tracks appear to touch in the far distance.'
        },
        {
          id: 'q4',
          prompt: 'If a painting feels unbalanced and heavy on the right side, what could the artist adjust to create equilibrium?',
          options: [
            'Erase the entire left side',
            'Introduce a strong complementary focal point or high-contrast element on the left side',
            'Pour white paint over the top',
            'Tilt the canvas sideways'
          ],
          correctIndex: 1,
          diagnosticHint: 'Visual weight can be balanced by contrast, color intensity, or object scale.'
        },
        {
          id: 'q5',
          prompt: 'How is secondary color Green formed on the traditional artist color wheel?',
          options: ['Mixing Red and Blue', 'Mixing Blue and Yellow', 'Mixing Yellow and Orange', 'Mixing Purple and White'],
          correctIndex: 1,
          diagnosticHint: 'Think about mixing cool blue sea water with bright yellow sun rays.'
        },
        {
          id: 'q6',
          prompt: 'What is the primary benefit of using a Socratic tutor when you feel stuck on a design composition?',
          options: [
            'The tutor draws the painting for you',
            'The tutor asks targeted questions so you discover the best composition choice yourself',
            'The tutor closes your computer',
            'The tutor submits an automated grade immediately'
          ],
          correctIndex: 1,
          diagnosticHint: 'Socratic guidance builds your own creative instincts through inquiry.'
        }
      ]),
      JSON.stringify({
        prompt: 'Create your original Geometric Harmony Artwork! Use at least one pair of complementary colors and an underlying geometric structure or linear perspective grid.',
        rubric: [
          { criteria: 'Color Harmony & Contrast', maxPoints: 25, description: 'Clear intentional use of complementary or harmonious color palettes.' },
          { criteria: 'Geometric Structure & Composition', maxPoints: 25, description: 'Application of grid balance, tessellation, or perspective.' },
          { criteria: 'Creative Execution & Craft', maxPoints: 25, description: 'Detail, care, and originality in the visual presentation.' },
          { criteria: 'Reflective Artist Statement', maxPoints: 25, description: 'Explanation of how the geometric and color decisions support the piece.' }
        ]
      })
    ]
  );

  // Course 2: Game Design & Cartesian Space
  const course2Id = uuidv4();
  await execute(
    `INSERT INTO courses (id, title, slug, description, age_track, passion_cluster, icon_name, badge_color, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      course2Id,
      'Game Design Mechanics & Cartesian Space Adventures',
      'game-design-cartesian-space',
      'Master X/Y coordinates, physics velocity vectors, collision detection, and platformer level algorithms by designing games.',
      'middle_school_10_13',
      'Game Design & Coding',
      'Gamepad2',
      '#3B82F6',
      now
    ]
  );

  // 6 Lessons for Course 2
  const course2Lessons = [
    {
      num: 1,
      title: 'Into the Grid: How Characters Move in Cartesian Space',
      duration: 15,
      hook: 'How does your favorite character know where to stand on screen? Welcome to the X and Y matrix!',
      objective: 'Plot and manipulate 2D player positions using Cartesian coordinates.',
      concepts: ['Cartesian Plane', 'X Horizontal Axis', 'Y Vertical Axis', 'Screen Coordinates'],
      vocab: ['Origin (0,0)', 'Coordinate', 'Position Vector', 'Quadrant'],
      analogies: ['A giant treasure map where X is steps East/West and Y is steps North/South'],
      reader: `### The 2D World Coordinate System
In video games, every pixel has an address: $(X, Y)$.
- $X$ controls left ($X < 0$) and right ($X > 0$).
- In math, $Y$ usually increases upward; in standard computer graphics, $Y$ often starts at $(0,0)$ in the top-left and increases downward!
When you press the arrow keys, code simply adds or subtracts from the player's coordinate.`,
      simType: 'coordinate_game',
      simConfig: { targetX: 200, targetY: 150 },
      pulse: {
        question: 'If a character starts at (10, 20) and moves 15 units to the right, what is their new position?',
        options: ['(25, 20)', '(10, 35)', '(-5, 20)', '(25, 35)'],
        correctIndex: 0,
        hint: 'Moving to the right changes the X coordinate: 10 + 15 = 25. The Y coordinate stays unchanged!'
      }
    },
    {
      num: 2,
      title: 'Velocity & Acceleration: Making the Player Jump',
      duration: 18,
      hook: 'Why does jumping feel floaty in some games and snappy in others? Meet delta time and gravity acceleration!',
      objective: 'Calculate changes in velocity vectors using gravity constants.',
      concepts: ['Velocity Vector', 'Acceleration', 'Gravity Constant', 'Frame Rate'],
      vocab: ['Velocity (dx, dy)', 'Acceleration', 'Terminal Velocity', 'Tick Rate'],
      analogies: ['Pushing a skateboard: velocity is how fast you roll; pushing harder is acceleration'],
      reader: `### Physics of the Jump
When Mario jumps:
1. An instantaneous vertical upward velocity is applied: $v_y = -12$.
2. Every game loop frame, gravity pulls downward: $v_y = v_y + 1$.
3. When $v_y$ crosses from negative to positive, the character reaches the apex of their jump and begins falling down!`,
      simType: 'coordinate_game',
      simConfig: { gravity: 0.8, jumpForce: -14 },
      pulse: {
        question: 'What is the vertical velocity of a character at the exact peak (apex) of their jump before falling?',
        options: ['-10', '0', '+15', 'Infinity'],
        correctIndex: 1,
        hint: 'At the exact turning point between going up and falling down, velocity momentarily pauses at zero.'
      }
    },
    {
      num: 3,
      title: 'The Coordinate Rocket Sandbox',
      duration: 20,
      hook: 'Can you steer a rocket through an asteroid belt using only coordinate thrust vectors?',
      objective: 'Combine X and Y velocity components to pilot an interactive spacecraft.',
      concepts: ['Vector Addition', 'Thrust Dynamics', 'Momentum'],
      vocab: ['Thrust', 'Vector Magnitude', 'Angle of Trajectory'],
      analogies: ['Swimming diagonally across a flowing river: your speed combines with the water flow'],
      reader: `### Interactive Rocket Navigation
Test your navigation skills in the sandbox below. Notice how applying thrust in both the X and Y axes simultaneously creates a diagonal vector whose speed can be calculated using the Pythagorean theorem:
$$V_{\\text{total}} = \\sqrt{V_x^2 + V_y^2}$$`,
      simType: 'coordinate_game',
      simConfig: { rocketMode: true },
      pulse: {
        question: 'If a rocket has a horizontal velocity of 3 units/sec and vertical velocity of 4 units/sec, what is its diagonal speed?',
        options: ['7 units/sec', '5 units/sec', '1 unit/sec', '12 units/sec'],
        correctIndex: 1,
        hint: 'Use the 3-4-5 right triangle formula: 3² (9) + 4² (16) = 25. The square root of 25 is 5!'
      }
    },
    {
      num: 4,
      title: 'Hitboxes & Collision Detection: Bounding Boxes Made Easy',
      duration: 22,
      hook: 'How does the game know when your sword hits the dragon or your bullet hits the target?',
      objective: 'Implement Axis-Aligned Bounding Box (AABB) collision checks.',
      concepts: ['AABB Collision', 'Hitbox', 'Overlap Detection'],
      vocab: ['Hitbox', 'Axis-Aligned Bounding Box', 'Interpenetration'],
      analogies: ['Two cardboard boxes sliding across the floor—checking if their edges cross over'],
      reader: `### AABB Collision Math
Two rectangular boxes $A$ and $B$ collide if and only if they overlap on BOTH the X axis and the Y axis simultaneously:
$$A.x < B.x + B.width \\quad \\text{and} \\quad A.x + A.width > B.x$$
$$A.y < B.y + B.height \\quad \\text{and} \\quad A.y + A.height > B.y$$
If any of these conditions are false, the objects are safely separated!`,
      simType: 'coordinate_game',
      simConfig: { collisionMode: true },
      pulse: {
        question: 'If Box A is completely to the left of Box B, can they still be colliding?',
        options: ['Yes, if they are touching in the future', 'No, because their X intervals do not overlap', 'Yes, if Y matches', 'Always'],
        correctIndex: 1,
        hint: 'Collision requires overlap in BOTH X and Y dimensions at the same time.'
      }
    },
    {
      num: 5,
      title: 'Scoring Algorithms & Variable State Management',
      duration: 20,
      hook: 'How do games save your high score, coin multipliers, and health bars without losing track?',
      objective: 'Structure state variables and conditional scoring logic.',
      concepts: ['State Variables', 'Combo Multipliers', 'Clamping Values'],
      vocab: ['State', 'Score', 'Multiplier', 'Clamp'],
      analogies: ['A scoreboard at a basketball stadium tracking score, fouls, and remaining clock time'],
      reader: `### Managing Game State
A game is a state machine:
- $Score = Score + (BasePoints \\times Multiplier)$
- $Health = \\max(0, \\min(100, Health - Damage))$
Using clamping ensures health never drops below zero into negative infinity!`,
      simType: 'coordinate_game',
      simConfig: { stateMode: true },
      pulse: {
        question: 'Why do developers clamp player health between 0 and 100?',
        options: [
          'To prevent bugs like negative health causing accidental invincibility or broken UI health bars',
          'Because computers cannot count higher than 100',
          'To make the game impossible to beat',
          'It is required by the controller'
        ],
        correctIndex: 0,
        hint: 'Clamping keeps variables inside clean bounds so game logic never crashes!'
      }
    },
    {
      num: 6,
      title: 'Level Design Architecture: Building a Platformer Map',
      duration: 25,
      hook: 'Great levels are not random—they are choreographed dance floors designed for fun!',
      objective: 'Synthesize coordinates, obstacles, and player pacing into a playable level schematic.',
      concepts: ['Level Pacing', 'Difficulty Curve', 'Risk vs. Reward'],
      vocab: ['Tilemap', 'Pacing', 'Telegraphing', 'Safe Zone'],
      analogies: ['Writing a story where each platform is a new chapter building up to a climax'],
      reader: `### Building Your Level
Combine all your game mechanics:
1. Establish the starting coordinates $(0, 200)$.
2. Place jump platforms with comfortable gap distances ($< 120\\text{px}$).
3. Insert coin collectibles that teach players where to jump.
4. Place the victory goal flag!`,
      simType: 'coordinate_game',
      simConfig: { levelBuilder: true },
      pulse: {
        question: 'What is the best way to introduce a tricky new game hazard to a player for the first time?',
        options: [
          'Drop it on them without warning from above',
          'Show it in a safe environment first where they can observe how it moves without immediate danger',
          'Make it an instant game-over',
          'Never show it at all'
        ],
        correctIndex: 1,
        hint: 'Good game design teaches mechanics safely before raising the stakes!'
      }
    }
  ];

  for (const l of course2Lessons) {
    await execute(
      `INSERT INTO lessons (
        id, course_id, lesson_number, title, duration_minutes, spark_hook, objective,
        key_concepts_json, allowed_vocab_json, analogies_json, reader_content,
        video_url, video_title, simulation_type, simulation_config_json,
        audio_summary_text, worksheet_title, worksheet_markdown, pulse_question_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        course2Id,
        l.num,
        l.title,
        l.duration,
        l.hook,
        l.objective,
        JSON.stringify(l.concepts),
        JSON.stringify(l.vocab),
        JSON.stringify(l.analogies),
        l.reader,
        'https://www.youtube-nocookie.com/embed/g2_b_vGj5Vw',
        `Game Engine Tutorial: ${l.title}`,
        l.simType,
        JSON.stringify(l.simConfig),
        `Listen to Nova's audio walkthrough on game mechanics and coordinates in ${l.title}!`,
        `Game Design Document: ${l.title}`,
        `# Level Schematic\n\n1. Plot 4 platform coordinate pairs: (X1, Y1) through (X4, Y4).\n2. Calculate the jump distance between platform 2 and 3.\n3. Define the collision hitbox for your hazard.`,
        JSON.stringify(l.pulse)
      ]
    );
  }

  // Milestone 7 Assessment for Course 2
  const assessment2Id = uuidv4();
  await execute(
    `INSERT INTO milestone_assessments (id, course_id, title, description, passing_score, questions_json, performance_task_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      assessment2Id,
      course2Id,
      'Milestone 7 Assessment: Platformer Mechanics & Coordinate Architecture',
      'Demonstrate your mastery of 2D coordinates, velocity vectors, and collisions, then submit your level design specification.',
      70,
      JSON.stringify([
        {
          id: 'q1',
          prompt: 'If a game object at coordinate (50, 80) has velocity vx = -5 and vy = 10 each second, what is its location after 2 seconds?',
          options: ['(40, 100)', '(60, 60)', '(45, 90)', '(50, 100)'],
          correctIndex: 0,
          diagnosticHint: 'X: 50 + 2(-5) = 40. Y: 80 + 2(10) = 100.'
        },
        {
          id: 'q2',
          prompt: 'What condition proves that two Axis-Aligned Bounding Boxes are NOT colliding horizontally?',
          options: [
            'Box A’s right edge is to the left of Box B’s left edge, or vice versa',
            'Both boxes have the same color',
            'Their heights are identical',
            'They are both moving at the same speed'
          ],
          correctIndex: 0,
          diagnosticHint: 'If one box ends before the other begins, they are separated with empty space in between.'
        },
        {
          id: 'q3',
          prompt: 'How does gravity affect a jumping character’s vertical velocity vector over time?',
          options: [
            'It keeps the velocity constant forever',
            'It adds downward velocity each frame until the player reaches ground or terminal velocity',
            'It reverses horizontal velocity',
            'It resets velocity to zero instantly'
          ],
          correctIndex: 1,
          diagnosticHint: 'Gravity is downward acceleration that continuously accumulates.'
        },
        {
          id: 'q4',
          prompt: 'Why is clamping used when updating player health or score multipliers?',
          options: [
            'To ensure the variable remains within valid game boundaries and avoids out-of-range bugs',
            'To make the game run faster on mobile',
            'Because negative numbers do not exist in code',
            'To encrypt the player data'
          ],
          correctIndex: 0,
          diagnosticHint: 'Clamping enforces upper and lower limits.'
        },
        {
          id: 'q5',
          prompt: 'If a player moves 3 pixels right and 4 pixels up in one frame, what is their direct diagonal distance traveled?',
          options: ['7 pixels', '5 pixels', '1 pixel', '12 pixels'],
          correctIndex: 1,
          diagnosticHint: 'Remember the classic 3-4-5 right triangle formula (Pythagorean theorem).'
        },
        {
          id: 'q6',
          prompt: 'When asking the AI Tutor EdBot for help on a tricky game math challenge, what will EdBot do?',
          options: [
            'Give you the answer immediately so you do not have to think',
            'Ask a guiding question to help you break down the problem step-by-step',
            'Report your account to the school principal',
            'Delete your game save'
          ],
          correctIndex: 1,
          diagnosticHint: 'EdBot uses the Socratic method to build your problem-solving superpowers.'
        }
      ]),
      JSON.stringify({
        prompt: 'Design a 3-platform obstacle course! Provide the coordinates (X, Y) for the platforms, define a moving hazard with velocity (vx, vy), and calculate the minimum jump velocity required to clear the gap.',
        rubric: [
          { criteria: 'Coordinate Accuracy', maxPoints: 25, description: 'All platforms and hazards have realistic, mathematically consistent coordinates.' },
          { criteria: 'Physics & Velocity Modeling', maxPoints: 25, description: 'Accurate velocity and jump acceleration calculations.' },
          { criteria: 'Level Pacing & Playability', maxPoints: 25, description: 'Pacing that balances challenge, fun, and player safety.' },
          { criteria: 'Technical Documentation', maxPoints: 25, description: 'Clear explanatory notes describing the mechanics.' }
        ]
      })
    ]
  );

  // Seed student progress for Leo
  await execute(
    `INSERT INTO student_progress (id, student_id, course_id, current_lesson, completed_lessons_json, streak_days, updated_at)
     VALUES (?, ?, ?, 3, ?, 4, ?)`,
    [uuidv4(), studentLeoId, course1Id, JSON.stringify([1, 2]), now]
  );

  // Seed sample submission from student Maya for teacher grading review
  await execute(
    `INSERT INTO student_submissions (
      id, student_id, assessment_id, course_id, auto_score, status,
      artifact_url, artifact_title, artifact_description, answers_json,
      teacher_grade, teacher_feedback, reviewed_by_id, reviewed_at, submitted_at
    ) VALUES (?, ?, ?, ?, 85, 'PENDING_TEACHER_REVIEW', ?, ?, ?, ?, NULL, NULL, NULL, NULL, ?)`,
    [
      uuidv4(),
      studentMayaId,
      assessment2Id,
      course2Id,
      'https://edpro.local/artifacts/maya_rocket_sandbox.png',
      'Maya\'s Space Rocket Level Blueprint',
      'I calculated the 3-4-5 velocity vector for my rocket boost and placed 4 platforms with AABB collision boxes. The player has to time their jump when the asteroid reaches apex Y=0.',
      JSON.stringify({ q1: 0, q2: 0, q3: 1, q4: 0, q5: 1, q6: 0 }),
      now
    ]
  );

  console.log('EdPro seed database populated successfully!');
  console.log('Demo Credentials:');
  console.log('  Admin:   username="admin", password="EdProPass123!"');
  console.log('  Teacher: username="teacher_carter", password="EdProPass123!"');
  console.log('  Student: username="leo_artist", password="EdProPass123!" (Arts focus, age 11)');
  console.log('  Student: username="maya_games", password="EdProPass123!" (Game coding focus, age 12)');
  console.log('  Student: username="sam_beats", password="EdProPass123!" (Music focus, age 8)');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runSeed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
