insert into users(id,name,age,points,streak) values (1,'Maya',9,1240,7) on conflict(id) do update set name=excluded.name, age=excluded.age, points=excluded.points, streak=excluded.streak;
insert into talents(slug,name,name_ar,description,description_ar,category,category_ar,icon,accent,total_lessons) values
('creative-arts','Creative Arts','الفنون الإبداعية','Turn big feelings into bold colors, stories, and beautiful ideas.','حوّل مشاعرك وأفكارك إلى ألوان وقصص وابتكارات جميلة.','Expression','تعبير','✦','coral',8),
('young-inventors','Young Inventors','المخترعون الصغار','Ask why, build prototypes, and make everyday things smarter.','اسأل لماذا، ابنِ نماذج أولية، واجعل الأشياء اليومية أذكى.','Build & solve','ابتكار وحل','⌁','cyan',10),
('story-lab','Story Lab','مختبر الحكايات','Find your voice through characters, words, and curious worlds.','اكتشف صوتك من خلال الشخصيات والكلمات والعوالم المدهشة.','Communication','تواصل','◌','lime',6),
('move-and-groove','Move & Groove','الحركة والإيقاع','Explore rhythm, coordination, and the joy of moving your way.','استكشف الإيقاع والتناسق ومتعة الحركة بطريقتك.','Energy','طاقة','↗','violet',7)
on conflict(slug) do nothing;
insert into progress_records(user_id,talent_slug,completed_lessons,total_lessons) values (1,'creative-arts',5,8),(1,'young-inventors',2,10) on conflict(user_id,talent_slug) do update set completed_lessons=excluded.completed_lessons,total_lessons=excluded.total_lessons;
insert into achievements(user_id,title,title_ar,icon) values (1,'First Spark','الشرارة الأولى','✦'),(1,'Creative Explorer','مستكشف الإبداع','◌'),(1,'Seven Day Streak','سلسلة سبعة أيام','🔥'),(1,'Curious Mind','عقل فضولي','⌁');
insert into notifications(user_id,title,body) values (1,'Your next spark is waiting.','You are one lesson away from your next badge.'),(1,'New path unlocked','Try Young Inventors next.');
