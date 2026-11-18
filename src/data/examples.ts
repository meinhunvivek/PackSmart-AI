import { InputState } from '../engine/types';

export interface TestCase {
  id: string;
  titleEn: string;
  titleHi: string;
  badge: string;
  expectedResultEn: string;
  expectedResultHi: string;
  inputs: InputState;
}

export const SAMPLE_CASES: TestCase[] = [
  {
    id: 'spinach-map',
    titleEn: 'Case A: Fresh Spinach (High Respiration Leafy Green)',
    titleHi: 'केस A: ताज़ा पालक (उच्च श्वसन हरी सब्जी)',
    badge: 'MAP & Perforated Film',
    expectedResultEn:
      'Engine will recommend Micro-perforated BOPP or Breathable LDPE with MAP gas equilibrium (O₂ 2-5%, CO₂ 5-10%) and reject suffocating hermetic foil.',
    expectedResultHi:
      'इंजन लेज़र सूक्ष्म-छिद्रित BOPP या सांस लेने योग्य LDPE की अनुशंसा करेगा (गैस O₂ 2-5%, CO₂ 5-10%) और अभेद्य फॉयल को खारिज करेगा।',
    inputs: {
      commodityId: 'spinach',
      commodityName: 'Spinach (leafy)',
      category: 'fresh',
      moisture: 91,
      fat: 0.4,
      pH: 6.5,
      respirationRate: 90,
      oxygenSensitive: false,
      lightSensitive: false,
      desiredShelfLifeDays: 7,
      storageType: 'chilled',
      storageTemp: 5,
      storageRH: 90,
      transportCondition: 'cold chain',
      packWeightG: 250,
      preference: 'balanced',
    },
  },
  {
    id: 'chips-n2',
    titleEn: 'Case B: Potato Chips (Crispness & Lipid Oxidation)',
    titleHi: 'केस B: आलू के चिप्स (कुरकुरापन व तेल सुरक्षा)',
    badge: 'Light Barrier & N₂ Flush',
    expectedResultEn:
      'Engine will recommend Metallized PET / LDPE laminate with 99%+ N₂ gas flush and exclude clear transparent films due to light sensitivity.',
    expectedResultHi:
      'इंजन मेटलाइज्ड PET / LDPE लेमिनेट और 99%+ नाइट्रोजन फ्लश की अनुशंसा करेगा और पारदर्शी फिल्मों को खारिज करेगा।',
    inputs: {
      commodityId: 'potato-chips',
      commodityName: 'Potato chips',
      category: 'fatty snack',
      moisture: 2,
      fat: 33,
      pH: 6.0,
      respirationRate: 0,
      oxygenSensitive: true,
      lightSensitive: true,
      desiredShelfLifeDays: 120,
      storageType: 'ambient',
      storageTemp: 25,
      storageRH: 65,
      transportCondition: 'long road',
      packWeightG: 50,
      preference: 'balanced',
    },
  },
  {
    id: 'frozen-peas',
    titleEn: 'Case C: Frozen Green Peas (Deep Freeze Storage)',
    titleHi: 'केस C: फ्रोजन हरी मटर (गहरा शीतलन)',
    badge: 'Sub-Zero Flex Puncture',
    expectedResultEn:
      'Engine will recommend PA/PE (Nylon coextruded) or LDPE for cold-crack resistance down to -18°C and reject brittle PLA/paper/cellulose.',
    expectedResultHi:
      'इंजन -18°C ठंड में लचीलापन बनाए रखने हेतु PA/PE नायलॉन या LDPE अनुशंसित करेगा और टूटने वाली PLA/कागज़ को अस्वीकृत करेगा।',
    inputs: {
      commodityId: 'frozen-peas',
      commodityName: 'Frozen peas',
      category: 'frozen',
      moisture: 78,
      fat: 0.4,
      pH: 6.5,
      respirationRate: 0,
      oxygenSensitive: false,
      lightSensitive: false,
      desiredShelfLifeDays: 365,
      storageType: 'frozen',
      storageTemp: -18,
      storageRH: 85,
      transportCondition: 'cold chain',
      packWeightG: 500,
      preference: 'balanced',
    },
  },
  {
    id: 'turmeric-opaque',
    titleEn: 'Case D: Turmeric Spice Powder (Photodegradation & Aroma)',
    titleHi: 'केस D: हल्दी मसाला पाउडर (प्रकाश व सुगंध सुरक्षा)',
    badge: 'Opaque Pouch & Aroma Seal',
    expectedResultEn:
      'Engine will recommend an opaque barrier laminate (Met-PET/LDPE or PET/Foil/PE) to protect curcumin pigment and volatile essential oils.',
    expectedResultHi:
      'इंजन करक्यूमिन रंग और सुगंध तेल की सुरक्षा हेतु अपारदर्शी मेटलाइज्ड या फॉयल लेमिनेट की अनुशंसा करेगा।',
    inputs: {
      commodityId: 'spice-turmeric',
      commodityName: 'Spice powder (Turmeric)',
      category: 'dry',
      moisture: 8,
      fat: 5,
      pH: 6.0,
      respirationRate: 0,
      oxygenSensitive: true,
      lightSensitive: true,
      desiredShelfLifeDays: 365,
      storageType: 'ambient',
      storageTemp: 25,
      storageRH: 65,
      transportCondition: 'long road',
      packWeightG: 100,
      preference: 'balanced',
    },
  },
];
