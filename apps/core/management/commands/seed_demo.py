import datetime

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import User
from apps.doctors.models import Doctor
from apps.mappings.models import PatientDoctorMapping
from apps.patients.models import Patient


class Command(BaseCommand):
    help = "Seeds database with realistic demo accounts, patients, doctors, and mappings."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding Clinix demonstration data..."))

        # 1. Primary Demo Users (both clinix.com and meditrack.com for seamless backwards compatibility)
        demo_clinix_email = "demo@clinix.com"
        demo_email = "demo@meditrack.com"
        demo_password = "Password123!"

        demo_user, _ = User.objects.get_or_create(
            email=demo_clinix_email,
            defaults={"name": "Dr. Sarah Jenkins", "is_staff": True},
        )
        demo_user.set_password(demo_password)
        demo_user.save()

        legacy_user, _ = User.objects.get_or_create(
            email=demo_email,
            defaults={"name": "Dr. Sarah Jenkins", "is_staff": True},
        )
        legacy_user.set_password(demo_password)
        legacy_user.save()

        # 2. Secondary Reviewer User (for testing multi-tenant isolation)
        reviewer_email = "reviewer@clinix.com"
        reviewer_password = "Password123!"
        reviewer_user, _ = User.objects.get_or_create(
            email=reviewer_email,
            defaults={"name": "Dr. Marcus Vance", "is_staff": False},
        )
        reviewer_user.set_password(reviewer_password)
        reviewer_user.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"Created demo users:\n  -> {demo_email} (Pass: {demo_password})\n  -> {reviewer_email} (Pass: {reviewer_password})"
            )
        )

        # 3. Doctors Catalog (~10 Doctors across specializations)
        doctors_data = [
            {
                "name": "Aarav Sharma",
                "specialization": "Cardiology",
                "license_number": "MED-IND-10492",
                "years_of_experience": 14,
                "hospital": "Metro Heart & Vascular Institute",
                "phone": "+1 (555) 234-5678",
                "email": "a.sharma@metroheart.org",
                "consultation_fee": 180.00,
                "availability": "Mon, Wed, Fri (09:00 - 15:00)",
            },
            {
                "name": "Elena Rostova",
                "specialization": "Neurology",
                "license_number": "MED-NEU-88219",
                "years_of_experience": 18,
                "hospital": "St. Jude Neuroscience Center",
                "phone": "+1 (555) 345-6789",
                "email": "elena.rostova@stjude-health.org",
                "consultation_fee": 220.00,
                "availability": "Tue, Thu (10:00 - 16:00)",
            },
            {
                "name": "Marcus Vance",
                "specialization": "Orthopedics",
                "license_number": "MED-ORT-45123",
                "years_of_experience": 11,
                "hospital": "City Orthopedic Clinic",
                "phone": "+1 (555) 456-7890",
                "email": "m.vance@cityortho.com",
                "consultation_fee": 150.00,
                "availability": "Mon - Thu (08:30 - 14:30)",
            },
            {
                "name": "Priya Nair",
                "specialization": "Pediatrics",
                "license_number": "MED-PED-73912",
                "years_of_experience": 9,
                "hospital": "Sunshine Children's Hospital",
                "phone": "+1 (555) 567-8901",
                "email": "priya.nair@sunshinekids.org",
                "consultation_fee": 120.00,
                "availability": "Mon - Fri (09:00 - 17:00)",
            },
            {
                "name": "David Chen",
                "specialization": "Oncology",
                "license_number": "MED-ONC-90241",
                "years_of_experience": 21,
                "hospital": "Memorial Cancer Center",
                "phone": "+1 (555) 678-9012",
                "email": "dchen@memorialcancer.org",
                "consultation_fee": 250.00,
                "availability": "Wed, Fri (11:00 - 17:00)",
            },
            {
                "name": "Sophia Martinez",
                "specialization": "Dermatology",
                "license_number": "MED-DER-31456",
                "years_of_experience": 8,
                "hospital": "Aesthetic Skin & Laser Center",
                "phone": "+1 (555) 789-0123",
                "email": "smartinez@skinsolutions.com",
                "consultation_fee": 140.00,
                "availability": "Mon, Tue, Thu (10:00 - 18:00)",
            },
            {
                "name": "Ethan Williams",
                "specialization": "Endocrinology",
                "license_number": "MED-END-62981",
                "years_of_experience": 12,
                "hospital": "Endocrine & Diabetes Care Center",
                "phone": "+1 (555) 890-1234",
                "email": "ewilliams@endocare.org",
                "consultation_fee": 160.00,
                "availability": "Tue, Wed, Fri (09:00 - 16:00)",
            },
            {
                "name": "Amira Al-Mansoor",
                "specialization": "Psychiatry",
                "license_number": "MED-PSY-55190",
                "years_of_experience": 15,
                "hospital": "MindWell Behavioral Health",
                "phone": "+1 (555) 901-2345",
                "email": "amira.m@mindwell.org",
                "consultation_fee": 190.00,
                "availability": "Mon - Fri (12:00 - 18:00)",
            },
            {
                "name": "Benjamin Becker",
                "specialization": "Gastroenterology",
                "license_number": "MED-GAS-19284",
                "years_of_experience": 16,
                "hospital": "Digestive Health Specialists",
                "phone": "+1 (555) 012-3456",
                "email": "bbecker@digestivehealth.org",
                "consultation_fee": 175.00,
                "availability": "Mon, Wed (08:00 - 14:00)",
            },
            {
                "name": "Rachel Taylor",
                "specialization": "General Medicine",
                "license_number": "MED-GEN-44910",
                "years_of_experience": 10,
                "hospital": "Downtown Community Clinic",
                "phone": "+1 (555) 123-7890",
                "email": "rtaylor@downtownclinic.org",
                "consultation_fee": 100.00,
                "availability": "Mon - Sat (08:00 - 16:00)",
            },
        ]

        created_doctors = []
        for doc in doctors_data:
            doctor_obj, _ = Doctor.objects.update_or_create(
                license_number=doc["license_number"],
                defaults={**doc, "created_by": demo_user, "is_active": True},
            )
            created_doctors.append(doctor_obj)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(created_doctors)} doctor profiles across specializations."
            )
        )

        # 4. Patients (~15 Realistic Patients for Demo User)
        now = timezone.now().date()
        patients_data = [
            {
                "name": "James Alexander Wilson",
                "age": 58,
                "gender": "M",
                "dob": now - datetime.timedelta(days=58 * 365),
                "blood_group": "O+",
                "phone": "+1 (555) 712-9901",
                "email": "j.wilson58@gmail.com",
                "address": "742 Evergreen Terrace, Springfield, OR",
                "medical_history": "Type 2 Diabetes diagnosed 2018. Essential hypertension controlled with lisinopril.",
                "allergies": "Penicillin (moderate rash)",
                "emergency_contact": "Martha Wilson (Wife) - +1 (555) 712-9902",
                "is_active": True,
            },
            {
                "name": "Clara Margaret Oswald",
                "age": 34,
                "gender": "F",
                "dob": now - datetime.timedelta(days=34 * 365),
                "blood_group": "A+",
                "phone": "+1 (555) 883-2019",
                "email": "clara.oswald@souffle.co.uk",
                "address": "42 Baker Street, London, UK",
                "medical_history": "Mild persistent asthma. History of sport ankle sprain in 2021.",
                "allergies": "Peanuts, Tree nuts (Anaphylactic risk - carries EpiPen)",
                "emergency_contact": "John Oswald (Brother) - +1 (555) 883-2020",
                "is_active": True,
            },
            {
                "name": "Liam Noah Gallagher",
                "age": 12,
                "gender": "M",
                "dob": now - datetime.timedelta(days=12 * 365),
                "blood_group": "B+",
                "phone": "+1 (555) 349-1102",
                "email": "gallagher.family@gmail.com",
                "address": "12 Burnage Lane, Manchester, UK",
                "medical_history": "Seasonal allergic rhinitis. Routine pediatric vaccinations up to date.",
                "allergies": "Latex, Dust mites",
                "emergency_contact": "Peggy Gallagher (Mother) - +1 (555) 349-1103",
                "is_active": True,
            },
            {
                "name": "Vivian Mae Thorne",
                "age": 71,
                "gender": "F",
                "dob": now - datetime.timedelta(days=71 * 365),
                "blood_group": "AB-",
                "phone": "+1 (555) 441-8923",
                "email": "vivian.thorne@verizon.net",
                "address": "808 Oakridge Boulevard, Seattle, WA",
                "medical_history": "Osteoarthritis in bilateral knees. Mild cognitive impairment monitoring.",
                "allergies": "Sulfa drugs, Aspirin (causes gastritis)",
                "emergency_contact": "Robert Thorne (Son) - +1 (555) 441-8924",
                "is_active": True,
            },
            {
                "name": "Ethan Samuel Vance",
                "age": 45,
                "gender": "M",
                "dob": now - datetime.timedelta(days=45 * 365),
                "blood_group": "O-",
                "phone": "+1 (555) 662-7711",
                "email": "e.vance@techcorp.io",
                "address": "100 Innovation Way, Austin, TX",
                "medical_history": "Chronic lower back pain (L4-L5 disc protrusion). High cholesterol.",
                "allergies": "No known drug allergies (NKDA)",
                "emergency_contact": "Jessica Vance (Spouse) - +1 (555) 662-7712",
                "is_active": True,
            },
            {
                "name": "Ananya Roy",
                "age": 29,
                "gender": "F",
                "dob": now - datetime.timedelta(days=29 * 365),
                "blood_group": "B+",
                "phone": "+1 (555) 991-3420",
                "email": "ananya.roy@outlook.com",
                "address": "500 Lakeview Terrace, Chicago, IL",
                "medical_history": "Migraines with visual aura. Hypothyroidism treated with levothyroxine 50mcg.",
                "allergies": "Ibuprofen / NSAIDs (facial edema)",
                "emergency_contact": "Karan Roy (Father) - +1 (555) 991-3421",
                "is_active": True,
            },
            {
                "name": "Mateo Gabriel Fernandez",
                "age": 52,
                "gender": "M",
                "dob": now - datetime.timedelta(days=52 * 365),
                "blood_group": "A-",
                "phone": "+1 (555) 552-1928",
                "email": "mateo.fernandez@miamihealth.net",
                "address": "1200 Ocean Drive, Miami Beach, FL",
                "medical_history": "Gastroesophageal reflux disease (GERD). Stage 1 hypertension.",
                "allergies": "Codeine (severe nausea)",
                "emergency_contact": "Lucia Fernandez (Wife) - +1 (555) 552-1929",
                "is_active": True,
            },
            {
                "name": "Harper Grace Evans",
                "age": 7,
                "gender": "F",
                "dob": now - datetime.timedelta(days=7 * 365),
                "blood_group": "O+",
                "phone": "+1 (555) 420-9182",
                "email": "evans.parent@icloud.com",
                "address": "334 Magnolia Court, Atlanta, GA",
                "medical_history": "Atopic dermatitis (eczema). Normal pediatric developmental milestones.",
                "allergies": "Eggs (mild hives)",
                "emergency_contact": "David Evans (Father) - +1 (555) 420-9183",
                "is_active": True,
            },
            {
                "name": "Dmitri Ivanovich Volkov",
                "age": 64,
                "gender": "M",
                "dob": now - datetime.timedelta(days=64 * 365),
                "blood_group": "AB+",
                "phone": "+1 (555) 831-4091",
                "email": "d.volkov@northstar.org",
                "address": "909 Pinecone Trail, Minneapolis, MN",
                "medical_history": "Coronary artery disease s/p stent placement in 2022. Takes atorvastatin and clopidogrel.",
                "allergies": "Cephalosporins",
                "emergency_contact": "Natasha Volkova (Daughter) - +1 (555) 831-4092",
                "is_active": True,
            },
            {
                "name": "Zoe Catherine Bell",
                "age": 22,
                "gender": "F",
                "dob": now - datetime.timedelta(days=22 * 365),
                "blood_group": "O+",
                "phone": "+1 (555) 302-8819",
                "email": "zoe.bell@campus.edu",
                "address": "210 University Ave, Berkeley, CA",
                "medical_history": "General wellness check. Anemia treated with oral iron supplements.",
                "allergies": "NKDA",
                "emergency_contact": "Susan Bell (Mother) - +1 (555) 302-8820",
                "is_active": True,
            },
            {
                "name": "Lucas Jean Dupont",
                "age": 41,
                "gender": "M",
                "dob": now - datetime.timedelta(days=41 * 365),
                "blood_group": "A+",
                "phone": "+1 (555) 774-6312",
                "email": "lucas.dupont@consulting.fr",
                "address": "45 Boulevard Saint-Germain, Boston, MA",
                "medical_history": "Generalized anxiety disorder. Regular psychotherapy and SSRI therapy.",
                "allergies": "Ciprofloxacin (tendon sensitivity)",
                "emergency_contact": "Claire Dupont (Sister) - +1 (555) 774-6313",
                "is_active": True,
            },
            {
                "name": "Fatima Zahra Khan",
                "age": 37,
                "gender": "F",
                "dob": now - datetime.timedelta(days=37 * 365),
                "blood_group": "B-",
                "phone": "+1 (555) 619-3388",
                "email": "f.khan@globaltech.com",
                "address": "812 Horizon Drive, San Jose, CA",
                "medical_history": "Gestational diabetes history in 2020. Annual glucose monitoring normal.",
                "allergies": "NKDA",
                "emergency_contact": "Tariq Khan (Spouse) - +1 (555) 619-3389",
                "is_active": True,
            },
            {
                "name": "Oliver Christopher Reed",
                "age": 67,
                "gender": "M",
                "dob": now - datetime.timedelta(days=67 * 365),
                "blood_group": "O+",
                "phone": "+1 (555) 923-4510",
                "email": "o.reed@heritagebooks.org",
                "address": "15 Wordsworth Court, Oxford, CT",
                "medical_history": "Benign prostatic hyperplasia (BPH). Stage 2 chronic kidney disease stable.",
                "allergies": "Morphine (severe dizziness and respiratory depression)",
                "emergency_contact": "Eleanor Reed (Wife) - +1 (555) 923-4511",
                "is_active": True,
            },
            {
                "name": "Maya Lin Tanaka",
                "age": 31,
                "gender": "F",
                "dob": now - datetime.timedelta(days=31 * 365),
                "blood_group": "A+",
                "phone": "+1 (555) 880-1492",
                "email": "maya.tanaka@creativestudio.jp",
                "address": "670 Sakura Way, Portland, OR",
                "medical_history": "PCOS managed with lifestyle and oral contraception. Vitamin D deficiency.",
                "allergies": "Shellfish",
                "emergency_contact": "Kenji Tanaka (Brother) - +1 (555) 880-1493",
                "is_active": True,
            },
            {
                "name": "Jordan Taylor Hayes",
                "age": 26,
                "gender": "O",
                "dob": now - datetime.timedelta(days=26 * 365),
                "blood_group": "AB+",
                "phone": "+1 (555) 512-7098",
                "email": "jordan.hayes@community.net",
                "address": "404 Cedar Grove, Boulder, CO",
                "medical_history": "Attention Deficit Hyperactivity Disorder (ADHD) managed with medication.",
                "allergies": "NKDA",
                "emergency_contact": "Taylor Hayes (Parent) - +1 (555) 512-7099",
                "is_active": True,
            },
        ]

        created_patients = []
        for i, pat in enumerate(patients_data):
            patient_obj, _ = Patient.objects.update_or_create(
                email=pat["email"],
                defaults={**pat, "created_by": demo_user, "is_active": True},
            )
            # Stagger created_at across past 6 months to populate the intake chart
            months_back = i % 6
            fake_created_time = timezone.now() - datetime.timedelta(days=months_back * 30 + (i * 2))
            Patient.objects.filter(pk=patient_obj.pk).update(created_at=fake_created_time)
            created_patients.append(patient_obj)

        # Also create 2 patients for the reviewer user to test isolation
        p_rev1, _ = Patient.objects.update_or_create(
            email="reviewer.patient1@private.org",
            defaults={
                "name": "Secret Patient (Reviewer Account Only)",
                "age": 42,
                "gender": "F",
                "blood_group": "O+",
                "created_by": reviewer_user,
                "is_active": True,
            },
        )
        p_rev2, _ = Patient.objects.update_or_create(
            email="reviewer.patient2@private.org",
            defaults={
                "name": "Confidential Patient (Reviewer Account Only)",
                "age": 30,
                "gender": "M",
                "blood_group": "AB-",
                "created_by": reviewer_user,
                "is_active": True,
            },
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(created_patients)} patients for Demo User + 2 patients for Reviewer User."
            )
        )

        # 5. Patient-Doctor Mappings
        # Assign doctors to first 12 patients; leave the last 3 with no doctor assigned
        mappings_data = [
            # James Wilson (Heart + Primary Care)
            (
                created_patients[0],
                created_doctors[0],
                True,
                "active",
                "Regular follow-up for hypertensive medication and ECG monitor.",
            ),
            (
                created_patients[0],
                created_doctors[9],
                False,
                "active",
                "Annual wellness exams and routine blood panels.",
            ),
            # Clara Oswald (Pediatrics / Pulmonology)
            (
                created_patients[1],
                created_doctors[3],
                True,
                "active",
                "Asthma management action plan and allergy check.",
            ),
            # Liam Gallagher (Pediatrics)
            (
                created_patients[2],
                created_doctors[3],
                True,
                "active",
                "Growth tracking and school sports clearance checkup.",
            ),
            # Vivian Thorne (Orthopedics + Neurology)
            (
                created_patients[3],
                created_doctors[2],
                True,
                "active",
                "Knee joint injections scheduled next month.",
            ),
            (
                created_patients[3],
                created_doctors[1],
                False,
                "active",
                "Annual memory assessment and neurological reflex exam.",
            ),
            # Ethan Vance (Orthopedics)
            (
                created_patients[4],
                created_doctors[2],
                True,
                "active",
                "Physical therapy referral following lumbar MRI.",
            ),
            # Ananya Roy (Neurology + Endocrinology)
            (
                created_patients[5],
                created_doctors[1],
                True,
                "active",
                "Migraine preventative medication titration.",
            ),
            (
                created_patients[5],
                created_doctors[6],
                False,
                "active",
                "TSH level review every 6 months.",
            ),
            # Mateo Fernandez (Gastroenterology)
            (
                created_patients[6],
                created_doctors[8],
                True,
                "active",
                "Endoscopy follow-up and proton pump inhibitor review.",
            ),
            # Harper Evans (Pediatrics + Dermatology)
            (
                created_patients[7],
                created_doctors[3],
                True,
                "active",
                "General wellness and pediatric vaccinations.",
            ),
            (
                created_patients[7],
                created_doctors[5],
                False,
                "active",
                "Topical management of pediatric atopic eczema.",
            ),
            # Dmitri Volkov (Cardiology + Oncology)
            (
                created_patients[8],
                created_doctors[0],
                True,
                "active",
                "Post-coronary stent cardiac rehab surveillance.",
            ),
            (
                created_patients[8],
                created_doctors[4],
                False,
                "active",
                "Routine surveillance screening.",
            ),
            # Zoe Bell (General Medicine)
            (
                created_patients[9],
                created_doctors[9],
                True,
                "active",
                "CBC checkup and dietary iron consultation.",
            ),
            # Lucas Dupont (Psychiatry)
            (
                created_patients[10],
                created_doctors[7],
                True,
                "active",
                "Bi-weekly psychotherapy check-ins and medication review.",
            ),
            # Fatima Khan (Endocrinology)
            (
                created_patients[11],
                created_doctors[6],
                True,
                "active",
                "Fasting glucose and HbA1c review.",
            ),
        ]

        assigned_count = 0
        for patient, doctor, is_primary, status_val, notes in mappings_data:
            mapping, _ = PatientDoctorMapping.objects.update_or_create(
                patient=patient,
                doctor=doctor,
                defaults={
                    "is_primary": is_primary,
                    "status": status_val,
                    "notes": notes,
                },
            )
            assigned_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {assigned_count} patient-doctor mappings (3 demo patients remain intentionally unassigned)."
            )
        )
        self.stdout.write(self.style.SUCCESS("Demo seeding completed successfully!"))
