import { HormonalSystemConfig } from '../types/simulator';

export const DEFAULT_HORMONAL_CONFIG: HormonalSystemConfig = {
  title: 'المحاكي الهرموني التفاعلي',
  subtitle: 'منظومة التفاعل الثلاثية: القوى الخمس · عشرون هرموناً · السيناريوهات',
  forces: [
    {
      id: 'vital',
      nameAr: 'القوى الحيوية',
      nameEn: 'Vital Force',
      baseline: 50,
      isIndependent: false,
      description: 'الطاقة الجسدية، الاستقلاب الخلوي، والقدرة على التحمل والنشاط اليومي.'
    },
    {
      id: 'sexual',
      nameAr: 'القوى الجنسية',
      nameEn: 'Sexual Force',
      baseline: 50,
      isIndependent: false,
      description: 'الرغبة، الجاذبية الحيوية، والاستجابة الفسيولوجية للتواصل الحميم.'
    },
    {
      id: 'spiritual',
      nameAr: 'القوى الروحية',
      nameEn: 'Spiritual Force',
      baseline: 50,
      isIndependent: true,
      description: 'قوة مرجعية مستقلة تؤثر في المنظومة وتضبط إيقاعها ولا تتأثر بارتدادات الهرمونات.'
    },
    {
      id: 'emotional',
      nameAr: 'القوى العاطفية',
      nameEn: 'Emotional Force',
      baseline: 50,
      isIndependent: false,
      description: 'الاتزان الوجداني، التعاطف، الترابط الاجتماعي، والاستقرار المزاجي.'
    },
    {
      id: 'mental',
      nameAr: 'القوى الذهنية',
      nameEn: 'Mental Force',
      baseline: 50,
      isIndependent: false,
      description: 'التركيز الإدراكي، الوضوح العقلي، الذاكرة العاملة، واتخاذ القرار.'
    }
  ],
  clusters: [
    {
      id: 'stress_metabolism',
      nameAr: 'محور التوتر والطاقة والأيض',
      nameEn: 'Stress, Energy & Metabolism',
      accent: 'amber'
    },
    {
      id: 'mood_sleep_bonding',
      nameAr: 'محور المزاج والنوم والترابط',
      nameEn: 'Mood, Sleep & Bonding',
      accent: 'sky'
    },
    {
      id: 'anabolism_reproduction',
      nameAr: 'محور البناء والتناسل',
      nameEn: 'Anabolism & Reproduction',
      accent: 'emerald'
    }
  ],
  hormones: [
    // Cluster 1: Stress, Energy & Metabolism (7 hormones)
    {
      id: 'cortisol',
      clusterId: 'stress_metabolism',
      nameAr: 'الكورتيزول',
      nameEn: 'Cortisol',
      baseline: 50,
      unit: '%',
      description: 'هرمون التكيف مع التوتر وتنظيم السكر واليقظة الصباحية.'
    },
    {
      id: 'adrenaline',
      clusterId: 'stress_metabolism',
      nameAr: 'الأدرينالين',
      nameEn: 'Adrenaline',
      baseline: 50,
      unit: '%',
      description: 'هرمون الاستجابة السريعة (الكر والفر) ورفع نبض القلب وضغط الدم.'
    },
    {
      id: 'insulin',
      clusterId: 'stress_metabolism',
      nameAr: 'الأنسولين',
      nameEn: 'Insulin',
      baseline: 50,
      unit: '%',
      description: 'هرمون توازن الجلوكوز وتخزين الطاقة ودعم البناء الأيضي.'
    },
    {
      id: 'thyroid',
      clusterId: 'stress_metabolism',
      nameAr: 'الغدة الدرقية',
      nameEn: 'Thyroid T3/T4',
      baseline: 50,
      unit: '%',
      description: 'منظم معدل الأيض الأساسي وحرارة الجسم وسرعة العمليات الذهنية.'
    },
    {
      id: 'glucagon',
      clusterId: 'stress_metabolism',
      nameAr: 'الجلوكاجون',
      nameEn: 'Glucagon',
      baseline: 50,
      unit: '%',
      description: 'يرفع سكر الدم عند الحاجة عبر تحرير الجليكوجين وإمداد الطاقة.'
    },
    {
      id: 'leptin',
      clusterId: 'stress_metabolism',
      nameAr: 'اللبتين',
      nameEn: 'Leptin',
      baseline: 50,
      unit: '%',
      description: 'هرمون الشبع وتنظيم مخزون الطاقة بعيد المدى في الجسم.'
    },
    {
      id: 'ghrelin',
      clusterId: 'stress_metabolism',
      nameAr: 'الجريلين',
      nameEn: 'Ghrelin',
      baseline: 50,
      unit: '%',
      description: 'هرمون الجوع وتحفيز الشهية واستشعار نقص الطاقة الفوري.'
    },

    // Cluster 2: Mood, Sleep & Bonding (7 hormones)
    {
      id: 'dopamine',
      clusterId: 'mood_sleep_bonding',
      nameAr: 'الدوبامين',
      nameEn: 'Dopamine',
      baseline: 50,
      unit: '%',
      description: 'ناقل التحفيز، المكافأة، التركيز، والسعي نحو الأهداف.'
    },
    {
      id: 'serotonin',
      clusterId: 'mood_sleep_bonding',
      nameAr: 'السيروتونين',
      nameEn: 'Serotonin',
      baseline: 50,
      unit: '%',
      description: 'منظم الرضا النفسي، الهدوء، الاتزان الانفعالي، وجودة الهضم.'
    },
    {
      id: 'melatonin',
      clusterId: 'mood_sleep_bonding',
      nameAr: 'الميلاتونين',
      nameEn: 'Melatonin',
      baseline: 50,
      unit: '%',
      description: 'هرمون الساعة البيولوجية والنوم العميق والاستشفاء الليلي.'
    },
    {
      id: 'oxytocin',
      clusterId: 'mood_sleep_bonding',
      nameAr: 'الأوكسيتوسين',
      nameEn: 'Oxytocin',
      baseline: 50,
      unit: '%',
      description: 'هرمون الأمان، المودة، الثقة، والترابط العاطفي العميق.'
    },
    {
      id: 'noradrenaline',
      clusterId: 'mood_sleep_bonding',
      nameAr: 'النورأدرينالين',
      nameEn: 'Noradrenaline',
      baseline: 50,
      unit: '%',
      description: 'ناقل الانتباه واليقظة الذهنية والاستجابة السريعة للتحديات.'
    },
    {
      id: 'gaba',
      clusterId: 'mood_sleep_bonding',
      nameAr: 'الجابا',
      nameEn: 'GABA',
      baseline: 50,
      unit: '%',
      description: 'الناقل المثبط الرئيسي لتهدئة الجهاز العصبي وخفض القلق.'
    },
    {
      id: 'endorphins',
      clusterId: 'mood_sleep_bonding',
      nameAr: 'الإندورفين',
      nameEn: 'Endorphins',
      baseline: 50,
      unit: '%',
      description: 'مسكنات الألم الطبيعية ومولّدات البهجة والارتياح العميق.'
    },

    // Cluster 3: Anabolism & Reproduction (6 hormones)
    {
      id: 'testosterone',
      clusterId: 'anabolism_reproduction',
      nameAr: 'التستوستيرون',
      nameEn: 'Testosterone',
      baseline: 50,
      unit: '%',
      description: 'هرمون البناء العضلي، الإقدام، الثقة، والدافع الجنسي.'
    },
    {
      id: 'estrogen',
      clusterId: 'anabolism_reproduction',
      nameAr: 'الإستروجين',
      nameEn: 'Estrogen',
      baseline: 50,
      unit: '%',
      description: 'هرمون التوازن الحيوي، حساسية المشاعر، ونضارة الأنسجة.'
    },
    {
      id: 'progesterone',
      clusterId: 'anabolism_reproduction',
      nameAr: 'البروجسترون',
      nameEn: 'Progesterone',
      baseline: 50,
      unit: '%',
      description: 'هرمون التهدئة العصبية وتوازن الإستروجين ودعم جودة النوم.'
    },
    {
      id: 'growth_hormone',
      clusterId: 'anabolism_reproduction',
      nameAr: 'هرمون النمو',
      nameEn: 'Growth Hormone',
      baseline: 50,
      unit: '%',
      description: 'هرمون التجديد الخلوي وبناء الأنسجة والاستشفاء العميق.'
    },
    {
      id: 'dhea',
      clusterId: 'anabolism_reproduction',
      nameAr: 'ديهيدرو إيبي أندروستيرون',
      nameEn: 'DHEA',
      baseline: 50,
      unit: '%',
      description: 'هرمون المرونة العصبية ومكافحة الشيخوخة وموازنة الكورتيزول.'
    },
    {
      id: 'prolactin',
      clusterId: 'anabolism_reproduction',
      nameAr: 'البرولاكتين',
      nameEn: 'Prolactin',
      baseline: 50,
      unit: '%',
      description: 'هرمون الإشباع وفترة الكمون بعد الذروة وتنظيم التوازن التناسلي.'
    }
  ],
  scenarios: [
    {
      id: 'baseline',
      category: 'control',
      nameAr: 'الحالة الطبيعية',
      nameEn: 'Baseline',
      isBaseline: true,
      description: 'توازن المنظومة عند نقطة الصفر المرجعية دون مثيرات استثنائية.',
      hormoneImpacts: {}
    },
    {
      id: 'free',
      category: 'control',
      nameAr: 'السيناريو الحر',
      nameEn: 'Free Mode',
      isFreeMode: true,
      description: 'تحكم يدوي كامل في مؤشرات الهرمونات والقوى لاختبار أي فرضية.',
      hormoneImpacts: {}
    },
    {
      id: 'stress',
      category: 'psychophysical',
      nameAr: 'التوتر',
      nameEn: 'Stress',
      description: 'تنشيط المحور السمبثاوي وارتفاع الكورتيزول والأدرينالين والنورأدرينالين مع كبح الراحة والبناء.',
      hormoneImpacts: {
        cortisol: 32,
        adrenaline: 35,
        insulin: -10,
        thyroid: 6,
        glucagon: 20,
        leptin: -14,
        ghrelin: 14,
        dopamine: -8,
        serotonin: -18,
        melatonin: -24,
        oxytocin: -16,
        noradrenaline: 32,
        gaba: -24,
        endorphins: -10,
        testosterone: -15,
        estrogen: -8,
        progesterone: -12,
        growth_hormone: -18,
        dhea: -16,
        prolactin: 10
      }
    },
    {
      id: 'meditation',
      category: 'psychophysical',
      nameAr: 'التأمل',
      nameEn: 'Meditation',
      description: 'تهدئة محور التوتر، ارتفاع الجابا والسيروتونين والميلاتونين وهرمون النمو وصفاء الذهن.',
      hormoneImpacts: {
        cortisol: -22,
        adrenaline: -20,
        insulin: 5,
        thyroid: 4,
        glucagon: -10,
        leptin: 10,
        ghrelin: -10,
        dopamine: 14,
        serotonin: 26,
        melatonin: 18,
        oxytocin: 20,
        noradrenaline: -18,
        gaba: 28,
        endorphins: 18,
        testosterone: 5,
        estrogen: 6,
        progesterone: 12,
        growth_hormone: 16,
        dhea: 18,
        prolactin: -4
      }
    },
    {
      id: 'relaxation',
      category: 'psychophysical',
      nameAr: 'الاسترخاء',
      nameEn: 'Relaxation',
      description: 'هيمنة الجهاز الباراسمبثاوي، خفض الاستنفار ورفع الجابا وهرمون النمو للاستشفاء.',
      hormoneImpacts: {
        cortisol: -18,
        adrenaline: -24,
        insulin: 8,
        thyroid: 2,
        glucagon: -12,
        leptin: 12,
        ghrelin: -12,
        dopamine: 8,
        serotonin: 22,
        melatonin: 24,
        oxytocin: 16,
        noradrenaline: -22,
        gaba: 26,
        endorphins: 14,
        testosterone: 6,
        estrogen: 8,
        progesterone: 14,
        growth_hormone: 22,
        dhea: 14,
        prolactin: -2
      }
    },
    {
      id: 'sex_para_during',
      category: 'sexual_response',
      nameAr: 'الجنس الباراسمبثاوي الهادئ (أثناء)',
      nameEn: 'Calm Parasympathetic (During)',
      description: 'اتصال حميم هادئ يغلب عليه الأوكسيتوسين والإندورفين والسيروتونين دون استنفار.',
      hormoneImpacts: {
        cortisol: -12,
        adrenaline: 6,
        insulin: 4,
        thyroid: 6,
        glucagon: 4,
        leptin: 6,
        ghrelin: -10,
        dopamine: 22,
        serotonin: 18,
        melatonin: -4,
        oxytocin: 34,
        noradrenaline: 10,
        gaba: 16,
        endorphins: 28,
        testosterone: 20,
        estrogen: 22,
        progesterone: 14,
        growth_hormone: 12,
        dhea: 16,
        prolactin: 8
      }
    },
    {
      id: 'sex_para_after',
      category: 'sexual_response',
      nameAr: 'ما بعد الجنس الباراسمبثاوي',
      nameEn: 'Parasympathetic Post-Effect',
      description: 'مرحلة السكينة العميقة والامتلاء العاطفي وارتفاع البرولاكتين والإندورفين والجابا.',
      hormoneImpacts: {
        cortisol: -22,
        adrenaline: -20,
        insulin: 8,
        thyroid: 0,
        glucagon: -10,
        leptin: 12,
        ghrelin: -14,
        dopamine: 6,
        serotonin: 28,
        melatonin: 24,
        oxytocin: 32,
        noradrenaline: -20,
        gaba: 24,
        endorphins: 26,
        testosterone: 4,
        estrogen: 12,
        progesterone: 16,
        growth_hormone: 18,
        dhea: 10,
        prolactin: 30
      }
    },
    {
      id: 'sex_symp_during',
      category: 'sexual_response',
      nameAr: 'الجنس السمبثاوي المندفع (أثناء)',
      nameEn: 'Intense Sympathetic (During)',
      description: 'اندفاع عالي الشدة يرفع الأدرينالين والنورأدرينالين والدوبامين والإندورفين والتستوستيرون.',
      hormoneImpacts: {
        cortisol: 16,
        adrenaline: 34,
        insulin: -8,
        thyroid: 12,
        glucagon: 18,
        leptin: -6,
        ghrelin: -12,
        dopamine: 34,
        serotonin: -6,
        melatonin: -18,
        oxytocin: 12,
        noradrenaline: 32,
        gaba: -12,
        endorphins: 30,
        testosterone: 30,
        estrogen: 16,
        progesterone: 4,
        growth_hormone: 14,
        dhea: 18,
        prolactin: 12
      }
    },
    {
      id: 'sex_symp_after',
      category: 'sexual_response',
      nameAr: 'ما بعد الجنس السمبثاوي',
      nameEn: 'Sympathetic Post-Effect',
      description: 'ذروة البرولاكتين وفترة الكمون مع هبوط الدوبامين والنورأدرينالين وحاجة للتعافي.',
      hormoneImpacts: {
        cortisol: 10,
        adrenaline: -16,
        insulin: 4,
        thyroid: -4,
        glucagon: -6,
        leptin: 4,
        ghrelin: 10,
        dopamine: -16,
        serotonin: 6,
        melatonin: 12,
        oxytocin: 8,
        noradrenaline: -18,
        gaba: 8,
        endorphins: 14,
        testosterone: -12,
        estrogen: 2,
        progesterone: 2,
        growth_hormone: 6,
        dhea: -10,
        prolactin: 36
      }
    }
  ],
  edges: [
    // Spiritual Force -> Outgoing ONLY (never receives incoming arrows)
    {
      id: 'sp_cortisol',
      from: 'spiritual',
      to: 'cortisol',
      weight: -0.28,
      type: 'spiritual',
      description: 'السكينة الروحية تخفف حدة الكورتيزول.'
    },
    {
      id: 'sp_serotonin',
      from: 'spiritual',
      to: 'serotonin',
      weight: 0.3,
      type: 'spiritual',
      description: 'الحضور الروحي يعزز السيروتونين والرضا.'
    },
    {
      id: 'sp_oxytocin',
      from: 'spiritual',
      to: 'oxytocin',
      weight: 0.28,
      type: 'spiritual',
      description: 'الرحمة والاتصال الروحي يرفعان الأوكسيتوسين.'
    },
    {
      id: 'sp_gaba',
      from: 'spiritual',
      to: 'gaba',
      weight: 0.3,
      type: 'spiritual',
      description: 'الطمأنينة الروحية تعزز الجابا وتهدئ الجهاز العصبي.'
    },
    {
      id: 'sp_dhea',
      from: 'spiritual',
      to: 'dhea',
      weight: 0.22,
      type: 'spiritual',
      description: 'الاتزان الروحي يدعم مرونة هرمون DHEA.'
    },
    {
      id: 'sp_emotional',
      from: 'spiritual',
      to: 'emotional',
      weight: 0.36,
      type: 'spiritual',
      description: 'ضبط مباشر للاتزان الوجداني والعاطفي.'
    },
    {
      id: 'sp_mental',
      from: 'spiritual',
      to: 'mental',
      weight: 0.32,
      type: 'spiritual',
      description: 'صفاء البصيرة يدعم الوضوح الذهني.'
    },
    {
      id: 'sp_vital',
      from: 'spiritual',
      to: 'vital',
      weight: 0.24,
      type: 'spiritual',
      description: 'السكينة تمنع استنزاف الطاقة الحيوية.'
    },

    // Intra-Hormone Dynamics (Balanced weights to avoid excessive runaway amplification across 20 nodes)
    {
      id: 'h_cort_adr',
      from: 'cortisol',
      to: 'adrenaline',
      weight: 0.28,
      type: 'excitatory',
      description: 'الكورتيزول يضاعف استجابة الأدرينالين.'
    },
    {
      id: 'h_cort_nor',
      from: 'cortisol',
      to: 'noradrenaline',
      weight: 0.26,
      type: 'excitatory',
      description: 'التوتر يرفع اليقظة عبر النورأدرينالين.'
    },
    {
      id: 'h_cort_gluc',
      from: 'cortisol',
      to: 'glucagon',
      weight: 0.24,
      type: 'excitatory',
      description: 'يحفز الكورتيزول إطلاق الجلوكاجون لتوفير الجلوكوز.'
    },
    {
      id: 'h_cort_ins',
      from: 'cortisol',
      to: 'insulin',
      weight: -0.24,
      type: 'inhibitory',
      description: 'ارتفاع الكورتيزول المزمن يضعف حساسية الأنسولين.'
    },
    {
      id: 'h_cort_mel',
      from: 'cortisol',
      to: 'melatonin',
      weight: -0.32,
      type: 'inhibitory',
      description: 'الكورتيزول المرتفع يثبط إفراز الميلاتونين.'
    },
    {
      id: 'h_cort_ser',
      from: 'cortisol',
      to: 'serotonin',
      weight: -0.26,
      type: 'inhibitory',
      description: 'التوتر المزمن يستنزف السيروتونين.'
    },
    {
      id: 'h_cort_test',
      from: 'cortisol',
      to: 'testosterone',
      weight: -0.28,
      type: 'inhibitory',
      description: 'الكورتيزول يكبح محور البناء والتستوستيرون.'
    },
    {
      id: 'h_cort_gh',
      from: 'cortisol',
      to: 'growth_hormone',
      weight: -0.26,
      type: 'inhibitory',
      description: 'الكورتيزول يثبط إفراز هرمون النمو والاستشفاء.'
    },
    {
      id: 'h_cort_dhea',
      from: 'cortisol',
      to: 'dhea',
      weight: -0.24,
      type: 'inhibitory',
      description: 'الضغط المستمر يستنزف احتياطي DHEA.'
    },
    {
      id: 'h_adr_mel',
      from: 'adrenaline',
      to: 'melatonin',
      weight: -0.28,
      type: 'inhibitory',
      description: 'اليقظة الأدرينالينية تمنع هرمون النوم.'
    },
    {
      id: 'h_ins_gluc',
      from: 'insulin',
      to: 'glucagon',
      weight: -0.32,
      type: 'inhibitory',
      description: 'الأنسولين والجلوكاجون يعملان بتضاد للحفاظ على توازن السكر.'
    },
    {
      id: 'h_gluc_ins',
      from: 'glucagon',
      to: 'insulin',
      weight: -0.24,
      type: 'inhibitory',
      description: 'ارتفاع الجلوكاجون يقابله انخفاض نسبي في الأنسولين.'
    },
    {
      id: 'h_lep_ghr',
      from: 'leptin',
      to: 'ghrelin',
      weight: -0.34,
      type: 'inhibitory',
      description: 'ارتفاع هرمون الشبع اللبتين يثبط هرمون الجوع الجريلين.'
    },
    {
      id: 'h_ghr_gh',
      from: 'ghrelin',
      to: 'growth_hormone',
      weight: 0.22,
      type: 'excitatory',
      description: 'الجريلين يحفز نبضات هرمون النمو أثناء الصيام.'
    },
    {
      id: 'h_thy_dop',
      from: 'thyroid',
      to: 'dopamine',
      weight: 0.24,
      type: 'excitatory',
      description: 'نشاط الغدة الدرقية يدعم يقظة الدوبامين.'
    },
    {
      id: 'h_ser_mel',
      from: 'serotonin',
      to: 'melatonin',
      weight: 0.34,
      type: 'excitatory',
      description: 'السيروتونين هو السلف الحيوي لتكوين الميلاتونين.'
    },
    {
      id: 'h_gaba_cort',
      from: 'gaba',
      to: 'cortisol',
      weight: -0.28,
      type: 'inhibitory',
      description: 'الجابا يهدئ المحور العصبي ويخفض الكورتيزول.'
    },
    {
      id: 'h_gaba_nor',
      from: 'gaba',
      to: 'noradrenaline',
      weight: -0.3,
      type: 'inhibitory',
      description: 'الجابا يكبح فرط استثارة النورأدرينالين.'
    },
    {
      id: 'h_gaba_gh',
      from: 'gaba',
      to: 'growth_hormone',
      weight: 0.22,
      type: 'excitatory',
      description: 'التهدئة بالجابا تدعم إفراز هرمون النمو ليلاً.'
    },
    {
      id: 'h_end_dop',
      from: 'endorphins',
      to: 'dopamine',
      weight: 0.26,
      type: 'excitatory',
      description: 'الإندورفين يعزز الشعور بالمكافأة الدوبامينية.'
    },
    {
      id: 'h_oxy_cort',
      from: 'oxytocin',
      to: 'cortisol',
      weight: -0.26,
      type: 'inhibitory',
      description: 'الأوكسيتوسين يهدئ استجابة الكورتيزول.'
    },
    {
      id: 'h_dop_test',
      from: 'dopamine',
      to: 'testosterone',
      weight: 0.24,
      type: 'excitatory',
      description: 'الدافعية الدوبامينية تعزز التستوستيرون.'
    },
    {
      id: 'h_prol_dop',
      from: 'prolactin',
      to: 'dopamine',
      weight: -0.32,
      type: 'inhibitory',
      description: 'ارتفاع البرولاكتين بعد الذروة يثبط الدوبامين ويحدث فترة الكمون.'
    },
    {
      id: 'h_prol_test',
      from: 'prolactin',
      to: 'testosterone',
      weight: -0.26,
      type: 'inhibitory',
      description: 'البرولاكتين المرتفع يحد مؤقتاً من التستوستيرون.'
    },
    {
      id: 'h_test_est',
      from: 'testosterone',
      to: 'estrogen',
      weight: 0.2,
      type: 'excitatory',
      description: 'توازن متبادل عبر مسار التحويل الأروماتي.'
    },
    {
      id: 'h_est_oxy',
      from: 'estrogen',
      to: 'oxytocin',
      weight: 0.24,
      type: 'excitatory',
      description: 'الإستروجين يزيد حساسية مستقبلات الأوكسيتوسين.'
    },
    {
      id: 'h_prog_gaba',
      from: 'progesterone',
      to: 'gaba',
      weight: 0.28,
      type: 'excitatory',
      description: 'مستقلبات البروجسترون تعزز مستقبلات الجابا المهدئة.'
    },
    {
      id: 'h_dhea_test',
      from: 'dhea',
      to: 'testosterone',
      weight: 0.24,
      type: 'excitatory',
      description: 'DHEA سلف هرموني يدعم التستوستيرون.'
    },
    {
      id: 'h_dhea_est',
      from: 'dhea',
      to: 'estrogen',
      weight: 0.2,
      type: 'excitatory',
      description: 'DHEA يدعم التوازن الإستروجيني.'
    },

    // Hormones -> 4 Interactive Forces (Balanced upward weights)
    {
      id: 'f_thy_vital',
      from: 'thyroid',
      to: 'vital',
      weight: 0.3,
      type: 'excitatory',
      description: 'الأيض الدرقي يرفع الطاقة الحيوية.'
    },
    {
      id: 'f_ins_vital',
      from: 'insulin',
      to: 'vital',
      weight: 0.2,
      type: 'excitatory',
      description: 'كفاءة الجلوكوز تغذي الخلايا بالطاقة.'
    },
    {
      id: 'f_gluc_vital',
      from: 'glucagon',
      to: 'vital',
      weight: 0.18,
      type: 'excitatory',
      description: 'إمداد الطاقة الفوري عند انخفاض السكر.'
    },
    {
      id: 'f_gh_vital',
      from: 'growth_hormone',
      to: 'vital',
      weight: 0.28,
      type: 'excitatory',
      description: 'التجديد الخلوي يرفع الحيوية الجسدية.'
    },
    {
      id: 'f_dhea_vital',
      from: 'dhea',
      to: 'vital',
      weight: 0.24,
      type: 'excitatory',
      description: 'يدعم الحيوية ومقاومة الإجهاد.'
    },
    {
      id: 'f_cort_vital',
      from: 'cortisol',
      to: 'vital',
      weight: -0.26,
      type: 'inhibitory',
      description: 'الاستنزاف بالكورتيزول يخفض الحيوية المستدامة.'
    },
    {
      id: 'f_test_sexual',
      from: 'testosterone',
      to: 'sexual',
      weight: 0.34,
      type: 'excitatory',
      description: 'المحرك الأساسي للدافع والقدرة الجنسية.'
    },
    {
      id: 'f_est_sexual',
      from: 'estrogen',
      to: 'sexual',
      weight: 0.28,
      type: 'excitatory',
      description: 'يدعم الاستجابة الحسية والتدفق الحيوي.'
    },
    {
      id: 'f_dop_sexual',
      from: 'dopamine',
      to: 'sexual',
      weight: 0.26,
      type: 'excitatory',
      description: 'ناقل الرغبة والإثارة والمكافأة.'
    },
    {
      id: 'f_dhea_sexual',
      from: 'dhea',
      to: 'sexual',
      weight: 0.2,
      type: 'excitatory',
      description: 'يعزز الحيوية والرغبة التناسلية.'
    },
    {
      id: 'f_prol_sexual',
      from: 'prolactin',
      to: 'sexual',
      weight: -0.32,
      type: 'inhibitory',
      description: 'البرولاكتين المرتفع يحدث فترة الكمون ويخفض الرغبة.'
    },
    {
      id: 'f_cort_sexual',
      from: 'cortisol',
      to: 'sexual',
      weight: -0.28,
      type: 'inhibitory',
      description: 'التوتر المزمن يثبط الرغبة والاستجابة الجنسية.'
    },
    {
      id: 'f_oxy_emotional',
      from: 'oxytocin',
      to: 'emotional',
      weight: 0.34,
      type: 'excitatory',
      description: 'جوهر التعاطف والأمان والمودة.'
    },
    {
      id: 'f_ser_emotional',
      from: 'serotonin',
      to: 'emotional',
      weight: 0.3,
      type: 'excitatory',
      description: 'الاستقرار المزاجي والسكينة الوجدانية.'
    },
    {
      id: 'f_end_emotional',
      from: 'endorphins',
      to: 'emotional',
      weight: 0.24,
      type: 'excitatory',
      description: 'البهجة وتخفيف الألم النفسي.'
    },
    {
      id: 'f_gaba_emotional',
      from: 'gaba',
      to: 'emotional',
      weight: 0.24,
      type: 'excitatory',
      description: 'الهدوء العصبي وتبديد القلق.'
    },
    {
      id: 'f_adr_emotional',
      from: 'adrenaline',
      to: 'emotional',
      weight: -0.24,
      type: 'inhibitory',
      description: 'التوتر الأدريناليني يعكر الصفو العاطفي.'
    },
    {
      id: 'f_dop_mental',
      from: 'dopamine',
      to: 'mental',
      weight: 0.38,
      type: 'excitatory',
      description: 'التركيز التنفيذي والتحفيز العقلي.'
    },
    {
      id: 'f_nor_mental',
      from: 'noradrenaline',
      to: 'mental',
      weight: 0.22,
      type: 'excitatory',
      description: 'اليقظة والانتباه الموجّه.'
    },
    {
      id: 'f_thy_mental',
      from: 'thyroid',
      to: 'mental',
      weight: 0.24,
      type: 'excitatory',
      description: 'سرعة المعالجة الذهنية واليقظة.'
    },
    {
      id: 'f_gaba_mental',
      from: 'gaba',
      to: 'mental',
      weight: 0.2,
      type: 'excitatory',
      description: 'يمنع التشتت العصبي ويدعم الصفاء.'
    },
    {
      id: 'f_cort_mental',
      from: 'cortisol',
      to: 'mental',
      weight: -0.28,
      type: 'inhibitory',
      description: 'الضغط الزائد يشتت الذاكرة العاملة والتركيز.'
    },

    // 4 Interactive Forces -> Hormones (Downward Balanced Feedback)
    {
      id: 'd_vital_thy',
      from: 'vital',
      to: 'thyroid',
      weight: 0.24,
      type: 'excitatory',
      description: 'الحيوية الجسدية تنشط كفاءة الغدة الدرقية.'
    },
    {
      id: 'd_vital_gh',
      from: 'vital',
      to: 'growth_hormone',
      weight: 0.24,
      type: 'excitatory',
      description: 'النشاط البدني يحفز إفراز هرمون النمو.'
    },
    {
      id: 'd_vital_cort',
      from: 'vital',
      to: 'cortisol',
      weight: -0.2,
      type: 'inhibitory',
      description: 'وفرة الطاقة الحيوية تخفف عبء الكورتيزول.'
    },
    {
      id: 'd_sexual_test',
      from: 'sexual',
      to: 'testosterone',
      weight: 0.36,
      type: 'excitatory',
      description: 'التنشيط الجنسي يحفز إفراز التستوستيرون.'
    },
    {
      id: 'd_sexual_est',
      from: 'sexual',
      to: 'estrogen',
      weight: 0.24,
      type: 'excitatory',
      description: 'الاستثارة الحسية تدعم التوازن الإستروجيني.'
    },
    {
      id: 'd_sexual_end',
      from: 'sexual',
      to: 'endorphins',
      weight: 0.24,
      type: 'excitatory',
      description: 'التفاعل الحميم يطلق الإندورفين.'
    },
    {
      id: 'd_emotional_oxy',
      from: 'emotional',
      to: 'oxytocin',
      weight: 0.38,
      type: 'excitatory',
      description: 'الدفء العاطفي يعزز إفراز الأوكسيتوسين.'
    },
    {
      id: 'd_emotional_gaba',
      from: 'emotional',
      to: 'gaba',
      weight: 0.24,
      type: 'excitatory',
      description: 'الأمان الوجداني يرفع الجابا المهدئ.'
    },
    {
      id: 'd_emotional_cort',
      from: 'emotional',
      to: 'cortisol',
      weight: -0.22,
      type: 'inhibitory',
      description: 'الاستقرار العاطفي يهدئ محور الكورتيزول.'
    },
    {
      id: 'd_mental_dop',
      from: 'mental',
      to: 'dopamine',
      weight: 0.26,
      type: 'excitatory',
      description: 'الانغماس الذهني والتركيز ينشطان الدوبامين.'
    },
    {
      id: 'd_mental_nor',
      from: 'mental',
      to: 'noradrenaline',
      weight: 0.2,
      type: 'excitatory',
      description: 'الانتباه العقلي يرفع النورأدرينالين المتوازن.'
    }
  ]
};
