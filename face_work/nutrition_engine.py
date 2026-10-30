"""AI Sports Nutrition & Fuel Engine for SANDOW Platform.
Provides personalized macronutrient targets, micronutrient recommendations,
and meal blueprints tailored to the user's exercise biomechanics, training intensity,
and physiological recovery demands.
Ready for LLM provider integration (Gemini, Claude, OpenAI).
"""
from typing import Dict, Any, List, Optional

NUTRITION_DATABASE: Dict[str, Dict[str, Any]] = {
    "pushups": {
        "workout_type": "Upper Body Calisthenics & Chest Hypertrophy",
        "focus": "Upper Pectoral & Triceps Protein Synthesis + Glycogen Restoration",
        "macros": {
            "calories": 540,
            "protein_g": 44,
            "carbs_g": 62,
            "fats_g": 12,
            "fiber_g": 8,
            "water_ml": 650
        },
        "recommended_meals": [
            {
                "id": "meal-p1",
                "name": "Grilled Lemon Herb Chicken & Quinoa Fuel Bowl",
                "timing": "30-60 mins Post-Workout",
                "calories": 540,
                "protein": "44g",
                "carbs": "62g",
                "fats": "12g",
                "description": "High-leucine lean poultry paired with complex slow-release carbohydrates and roasted vegetables to maximize anabolic muscle repair.",
                "key_ingredients": [
                    "200g Grilled Chicken Breast",
                    "1 cup Cooked Tricolor Quinoa",
                    "1 cup Steamed Broccoli & Zucchini",
                    "1 tbsp Cold-Pressed Extra Virgin Olive Oil",
                    "Fresh Lemon & Rosemary Dressing"
                ],
                "micronutrient_spotlight": "Zinc & Vitamin B6 for testosterone synthesis and cellular amino acid uptake."
            },
            {
                "id": "meal-p2",
                "name": "Grass-Fed Whey Anabolic Smoothie Bowl",
                "timing": "Immediate Post-Workout (0-30 min)",
                "calories": 480,
                "protein": "42g",
                "carbs": "56g",
                "fats": "10g",
                "description": "Rapidly absorbed micro-filtered whey isolate blended with antioxidant-rich blueberries, rolled oats, and almond butter.",
                "key_ingredients": [
                    "1.5 scoops Whey Isolate (Vanilla)",
                    "1/2 cup Rolled Oats (ground)",
                    "1 cup Frozen Wild Blueberries",
                    "1 tbsp Natural Almond Butter",
                    "300ml Unsweetened Almond Milk"
                ],
                "micronutrient_spotlight": "Polyphenols to attenuate delayed-onset muscle soreness (DOMS)."
            }
        ],
        "hydration_protocol": "Drink 500-750ml water infused with a pinch of Himalayan pink salt and lemon within 1 hour post-training.",
        "supplement_stack": ["Creatine Monohydrate (5g)", "L-Citrulline Malate (6g Pre)", "Vitamin D3 (2000 IU)"]
    },
    "squats": {
        "workout_type": "Posterior Chain, Quadriceps & Glute Kinetic Power",
        "focus": "High-Calorie Neuro-Muscular Glycogen Replenishment & Anti-Inflammatory Recovery",
        "macros": {
            "calories": 650,
            "protein_g": 48,
            "carbs_g": 78,
            "fats_g": 16,
            "fiber_g": 10,
            "water_ml": 850
        },
        "recommended_meals": [
            {
                "id": "meal-sq1",
                "name": "Grass-Fed Lean Beef & Roasted Sweet Potato Power Plate",
                "timing": "45-75 mins Post-Workout",
                "calories": 650,
                "protein": "48g",
                "carbs": "78g",
                "fats": "16g",
                "description": "Dense bioavailable iron, creatine, and beta-carotene fuel designed to restore leg muscle glycogen depleted during deep squat sets.",
                "key_ingredients": [
                    "180g 93% Lean Grass-Fed Ground Beef",
                    "250g Roasted Cinnamon Sweet Potatoes",
                    "2 cups Sautéed Baby Spinach in Garlic",
                    "1/4 Hass Avocado",
                    "Pink Himalayan Sea Salt"
                ],
                "micronutrient_spotlight": "Heme-Iron, Magnesium, and Potassium for neuromuscular excitation-contraction recovery."
            },
            {
                "id": "meal-sq2",
                "name": "Pan-Seared Atlantic Salmon & Wild Rice Skillet",
                "timing": "Post-Workout Dinner",
                "calories": 620,
                "protein": "45g",
                "carbs": "65g",
                "fats": "18g",
                "description": "Omega-3 fatty acids directly suppress muscle tissue inflammation and promote knee cartilage recovery.",
                "key_ingredients": [
                    "200g Wild Atlantic Salmon Fillet",
                    "1 cup Steamed Wild Rice Blend",
                    "8 Roasted Asparagus Spears",
                    "1 tbsp Toasted Sesame Seeds",
                    "Tamari Soy Reduction"
                ],
                "micronutrient_spotlight": "EPA/DHA Omega-3s and Selenium for systemic anti-inflammatory response."
            }
        ],
        "hydration_protocol": "Drink 750-1000ml water with sodium, potassium, and magnesium electrolytes to replenish leg sweat loss.",
        "supplement_stack": ["Tart Cherry Extract (anti-DOMS)", "Whey Protein + Dextrose (40g/30g)", "Magnesium Glycinate (400mg before bed)"]
    },
    "situps": {
        "workout_type": "Core Stabilization & Rectus Abdominis Endurance",
        "focus": "Lean Metabolic Fuel, Gut Health & Zero Bloating",
        "macros": {
            "calories": 460,
            "protein_g": 38,
            "carbs_g": 48,
            "fats_g": 10,
            "fiber_g": 9,
            "water_ml": 600
        },
        "recommended_meals": [
            {
                "id": "meal-su1",
                "name": "Mediterranean Tuna & Chickpea Superfood Salad",
                "timing": "30-45 mins Post-Workout",
                "calories": 460,
                "protein": "38g",
                "carbs": "48g",
                "fats": "10g",
                "description": "Light, non-bloating high-protein meal optimized for abdominal muscle definition and digestive comfort.",
                "key_ingredients": [
                    "150g Pole-Caught White Albacore Tuna",
                    "3/4 cup Spiced Chickpeas",
                    "Cucumber, Cherry Tomatoes, Kalamata Olives",
                    "1 tbsp Extra Virgin Olive Oil & Lemon",
                    "Fresh Parsley & Mint"
                ],
                "micronutrient_spotlight": "Folate, Choline, and Vitamin C for tissue collagen repair."
            }
        ],
        "hydration_protocol": "Hydrate steadily with 500ml water and electrolytes; avoid carbonated beverages right after core flexion.",
        "supplement_stack": ["Glutamine (5g)", "Digestive Enzymes", "Probiotics"]
    },
    "jumping_jacks": {
        "workout_type": "High-Intensity Plyometrics & Aerobic Conditioning",
        "focus": "Rapid Glycogen Reload, Electrolyte Rebalancing & Joint Elasticity",
        "macros": {
            "calories": 510,
            "protein_g": 36,
            "carbs_g": 68,
            "fats_g": 11,
            "fiber_g": 7,
            "water_ml": 900
        },
        "recommended_meals": [
            {
                "id": "meal-jj1",
                "name": "Electrolyte Acai Recovery Bowl with Greek Yogurt",
                "timing": "Immediate Post-Workout",
                "calories": 510,
                "protein": "36g",
                "carbs": "68g",
                "fats": "11g",
                "description": "Hydrating fruit antioxidants paired with strained Greek yogurt to replenish high-cadence cardiovascular energy expenditure.",
                "key_ingredients": [
                    "200g Authentic Strained Greek Yogurt (0% fat)",
                    "1 frozen Acai packet (unsweetened)",
                    "1 Sliced Banana",
                    "2 tbsp Hemp Seeds & Raw Honey drizzle",
                    "Handful of Crushed Walnuts"
                ],
                "micronutrient_spotlight": "Potassium (850mg) and Calcium for rapid re-hydration and cardiac contraction rhythm."
            }
        ],
        "hydration_protocol": "Drink 800ml cold coconut water or isotonic electrolyte beverage within 45 mins.",
        "supplement_stack": ["Electrolyte Salts (Sodium 500mg, Potassium 200mg)", "BCAAs/EAAs", "CoQ10 (100mg)"]
    },
    "lunges": {
        "workout_type": "Unilateral Lower Body & Kinetic Balance",
        "focus": "Gluteal Hypertrophy, Tendon Strength & Joint Alignment",
        "macros": {
            "calories": 600,
            "protein_g": 46,
            "carbs_g": 72,
            "fats_g": 14,
            "fiber_g": 8,
            "water_ml": 750
        },
        "recommended_meals": [
            {
                "id": "meal-lu1",
                "name": "Herb-Crusted Turkey Cutlet with Roasted Butternut Squash",
                "timing": "45-60 mins Post-Workout",
                "calories": 600,
                "protein": "46g",
                "carbs": "72g",
                "fats": "14g",
                "description": "Ultra-lean poultry protein paired with potassium-dense butternut squash to support unilateral muscular imbalances and hip stability.",
                "key_ingredients": [
                    "200g Lean Turkey Breast Cutlet",
                    "250g Roasted Butternut Squash Cubes",
                    "1 cup Steamed French Green Beans",
                    "1 tbsp Extra Virgin Avocado Oil",
                    "Pinch of Fresh Thyme & Sea Salt"
                ],
                "micronutrient_spotlight": "Collagen peptides and Vitamin C for patellar tendon resilience."
            }
        ],
        "hydration_protocol": "Drink 700ml water with essential trace minerals.",
        "supplement_stack": ["Collagen Hydrolysate (15g with 50mg Vit C)", "Curcumin/Turmeric", "Glucosamine/Chondroitin"]
    },
    "biceps_curls": {
        "workout_type": "Brachialis & Biceps Brachii Hypertrophy Isolation",
        "focus": "Intra-Cellular Cell Swelling & Hypertrophic Protein Synthesis",
        "macros": {
            "calories": 500,
            "protein_g": 44,
            "carbs_g": 54,
            "fats_g": 11,
            "fiber_g": 6,
            "water_ml": 600
        },
        "recommended_meals": [
            {
                "id": "meal-bc1",
                "name": "Cottage Cheese & Honey Fluff with Toasted Oats & Berries",
                "timing": "30-45 mins Post-Workout",
                "calories": 500,
                "protein": "44g",
                "carbs": "54g",
                "fats": "11g",
                "description": "Sustained-release casein and whey protein matrix designed for sustained amino acid flood into localized arm flexor tissue.",
                "key_ingredients": [
                    "250g Organic Low-Fat Cottage Cheese",
                    "1/2 scoop Vanilla Whey Protein",
                    "1 cup Fresh Strawberries & Raspberries",
                    "1/3 cup Toasted Rolled Oats",
                    "1 tbsp Raw Clover Honey"
                ],
                "micronutrient_spotlight": "Calcium, Phosphorus, and Bioactive Casein peptides for prolonged protein synthesis."
            }
        ],
        "hydration_protocol": "Drink 500-600ml water; prioritize hydration during the workout to maintain muscle intracellular volumization.",
        "supplement_stack": ["Creatine Monohydrate (5g)", "L-Arginine / Citrulline for Nitric Oxide pump", "Zinc"]
    }
}

def get_nutrition_recommendation(exercise: str, goal: Optional[str] = None) -> Dict[str, Any]:
    """Retrieves or generates tailored sports nutrition and meal advice based on exercise and goal."""
    clean_ex = exercise.lower().replace("-", "").replace("_", "").replace(" ", "").strip()
    
    matched_key = "pushups"
    if "squat" in clean_ex:
        matched_key = "squats"
    elif "sit" in clean_ex or "core" in clean_ex:
        matched_key = "situps"
    elif "jack" in clean_ex or "jump" in clean_ex or "cardio" in clean_ex:
        matched_key = "jumping_jacks"
    elif "lunge" in clean_ex:
        matched_key = "lunges"
    elif "curl" in clean_ex or "bicep" in clean_ex or "arm" in clean_ex:
        matched_key = "biceps_curls"
    
    plan = dict(NUTRITION_DATABASE.get(matched_key, NUTRITION_DATABASE["pushups"]))
    plan["target_exercise"] = exercise
    plan["user_goal"] = goal or "Athletic Performance & Hypertrophy"
    plan["llm_ready"] = True
    plan["ai_provider"] = "SANDOW DeepBiomechanics Nutrition Engine (LLM-Ready)"
    
    return plan
