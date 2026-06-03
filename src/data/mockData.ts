import { Product, Review, Order } from '@/shared/types/global.types'

export const mockProducts: Product[] = [
  {
    id:'prod_001', handle:'cashmere-oversized-coat', title:'Cashmere Oversized Coat',
    shortDescription:'Pure Grade A cashmere, effortlessly structured.',
    description:'A masterpiece of considered tailoring, this oversized coat is crafted from 100% Grade A Mongolian cashmere. The relaxed silhouette drapes beautifully over any outfit. Features include a notched lapel, single button closure, dual welt pockets, and a fully lined interior in silk-blend fabric.',
    price:495, compareAtPrice:650, currency:'USD',
    images:[
      {url:'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=900&q=80',altText:'Cashmere Coat Front',width:900,height:1100},
      {url:'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=900&q=80',altText:'Cashmere Coat Back',width:900,height:1100},
    ],
    variants:[
      {id:'var_001_xs',title:'XS / Camel',availableForSale:true,price:495,compareAtPrice:650,selectedOptions:[{name:'Size',value:'XS'},{name:'Color',value:'Camel'}]},
      {id:'var_001_s',title:'S / Camel',availableForSale:true,price:495,compareAtPrice:650,selectedOptions:[{name:'Size',value:'S'},{name:'Color',value:'Camel'}]},
      {id:'var_001_m',title:'M / Camel',availableForSale:true,price:495,compareAtPrice:650,selectedOptions:[{name:'Size',value:'M'},{name:'Color',value:'Camel'}]},
      {id:'var_001_l',title:'L / Camel',availableForSale:true,price:495,compareAtPrice:650,selectedOptions:[{name:'Size',value:'L'},{name:'Color',value:'Camel'}]},
    ],
    options:[
      {id:'opt_001_s',name:'Size',values:['XS','S','M','L','XL']},
      {id:'opt_001_c',name:'Color',values:['Camel','Charcoal','Ivory']},
    ],
    category:'Outerwear', tags:['cashmere','coat','winter','bestseller'],
    rating:{rate:4.9,count:312}, inStock:true, isBestseller:true, isSale:true,
    collections:['new-arrivals','outerwear'],
  },
  {
    id:'prod_002', handle:'silk-slip-dress', title:'Silk Slip Dress',
    shortDescription:'Liquid mulberry silk, bias-cut elegance.',
    description:'Cut on the bias from 100% mulberry silk charmeuse, this slip dress glides with every movement. The adjustable spaghetti straps and V-neckline create a timeless silhouette that works equally well dressed up or down.',
    price:285, currency:'USD',
    images:[
      {url:'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=900&q=80',altText:'Silk Slip Dress',width:900,height:1100},
      {url:'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=900&q=80',altText:'Silk Slip Dress detail',width:900,height:1100},
    ],
    variants:[
      {id:'var_002_xs',title:'XS / Champagne',availableForSale:true,price:285,selectedOptions:[{name:'Size',value:'XS'},{name:'Color',value:'Champagne'}]},
      {id:'var_002_s',title:'S / Champagne',availableForSale:true,price:285,selectedOptions:[{name:'Size',value:'S'},{name:'Color',value:'Champagne'}]},
      {id:'var_002_m',title:'M / Champagne',availableForSale:true,price:285,selectedOptions:[{name:'Size',value:'M'},{name:'Color',value:'Champagne'}]},
    ],
    options:[
      {id:'opt_002_s',name:'Size',values:['XS','S','M','L']},
      {id:'opt_002_c',name:'Color',values:['Champagne','Midnight','Blush']},
    ],
    category:'Dresses', tags:['silk','dress','evening','new'],
    rating:{rate:4.7,count:189}, inStock:true, isNew:true,
    collections:['new-arrivals','dresses'],
  },
  {
    id:'prod_003', handle:'merino-turtleneck', title:'Merino Turtleneck Sweater',
    shortDescription:'Extra-fine 18.5 micron merino, machine washable.',
    description:'Knitted from extra-fine 18.5 micron merino wool — the kind that\'s genuinely soft against bare skin. The relaxed turtleneck can be worn folded or slouched. Machine washable.',
    price:165, currency:'USD',
    images:[
      {url:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&q=80',altText:'Merino Turtleneck',width:900,height:1100},
      {url:'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=900&q=80',altText:'Merino detail',width:900,height:1100},
    ],
    variants:[
      {id:'var_003_s',title:'S / Oatmeal',availableForSale:true,price:165,selectedOptions:[{name:'Size',value:'S'},{name:'Color',value:'Oatmeal'}]},
      {id:'var_003_m',title:'M / Oatmeal',availableForSale:true,price:165,selectedOptions:[{name:'Size',value:'M'},{name:'Color',value:'Oatmeal'}]},
      {id:'var_003_l',title:'L / Oatmeal',availableForSale:true,price:165,selectedOptions:[{name:'Size',value:'L'},{name:'Color',value:'Oatmeal'}]},
    ],
    options:[
      {id:'opt_003_s',name:'Size',values:['XS','S','M','L','XL']},
      {id:'opt_003_c',name:'Color',values:['Oatmeal','Slate','Forest','Black']},
    ],
    category:'Knitwear', tags:['merino','sweater','knitwear'],
    rating:{rate:4.8,count:421}, inStock:true, isBestseller:true,
    collections:['knitwear'],
  },
  {
    id:'prod_004', handle:'wide-leg-trousers', title:'Linen Wide-Leg Trousers',
    shortDescription:'100% pre-washed linen, elastic waistband.',
    description:'Wide-leg trousers in 100% pre-washed linen. The elastic waistband with internal drawstring means they\'re as comfortable as they are polished.',
    price:195, compareAtPrice:240, currency:'USD',
    images:[{url:'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=80',altText:'Wide Leg Trousers',width:900,height:1100}],
    variants:[
      {id:'var_004_xs',title:'XS / Sand',availableForSale:true,price:195,compareAtPrice:240,selectedOptions:[{name:'Size',value:'XS'},{name:'Color',value:'Sand'}]},
      {id:'var_004_s',title:'S / Sand',availableForSale:true,price:195,compareAtPrice:240,selectedOptions:[{name:'Size',value:'S'},{name:'Color',value:'Sand'}]},
    ],
    options:[
      {id:'opt_004_s',name:'Size',values:['XS','S','M','L','XL']},
      {id:'opt_004_c',name:'Color',values:['Sand','Ecru','Black']},
    ],
    category:'Trousers', tags:['linen','trousers','summer','sale'],
    rating:{rate:4.6,count:203}, inStock:true, isSale:true,
    collections:['trousers','summer-edit'],
  },
  {
    id:'prod_005', handle:'leather-crossbody-bag', title:'Leather Crossbody Bag',
    shortDescription:'Full-grain veg-tan leather, hand-stitched in Tuscany.',
    description:'Hand-stitched in full-grain vegetable-tanned leather by artisans in Tuscany. Adjustable strap, antique brass hardware.',
    price:385, currency:'USD',
    images:[
      {url:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80',altText:'Leather Crossbody',width:900,height:900},
      {url:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=80',altText:'Detail',width:900,height:900},
    ],
    variants:[
      {id:'var_005_tan',title:'Cognac',availableForSale:true,price:385,selectedOptions:[{name:'Color',value:'Cognac'}]},
      {id:'var_005_blk',title:'Black',availableForSale:true,price:385,selectedOptions:[{name:'Color',value:'Black'}]},
    ],
    options:[{id:'opt_005_c',name:'Color',values:['Cognac','Black','Olive']}],
    category:'Bags', tags:['leather','bag','accessories'],
    rating:{rate:4.9,count:156}, inStock:true, isBestseller:true,
    collections:['accessories','bags'],
  },
  {
    id:'prod_006', handle:'ribbed-modal-tank', title:'Ribbed Modal Tank',
    shortDescription:'Featherlight modal-cotton rib, endlessly layerable.',
    description:'A foundational tank in a featherlight modal-cotton rib. Our most-restocked item for good reason.',
    price:65, currency:'USD',
    images:[{url:'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=900&q=80',altText:'Ribbed Modal Tank',width:900,height:1100}],
    variants:[
      {id:'var_006_xs',title:'XS / White',availableForSale:true,price:65,selectedOptions:[{name:'Size',value:'XS'},{name:'Color',value:'White'}]},
      {id:'var_006_s',title:'S / White',availableForSale:true,price:65,selectedOptions:[{name:'Size',value:'S'},{name:'Color',value:'White'}]},
      {id:'var_006_m',title:'M / White',availableForSale:true,price:65,selectedOptions:[{name:'Size',value:'M'},{name:'Color',value:'White'}]},
    ],
    options:[
      {id:'opt_006_s',name:'Size',values:['XS','S','M','L','XL']},
      {id:'opt_006_c',name:'Color',values:['White','Black','Sage','Blush']},
    ],
    category:'Tops', tags:['modal','tank','basics','new'],
    rating:{rate:4.5,count:634}, inStock:true, isNew:true,
    collections:['tops','basics'],
  },
  {
    id:'prod_007', handle:'tailored-blazer', title:'Structured Tailored Blazer',
    shortDescription:'Italian wool-blend, sharp minimal silhouette.',
    description:'Cut from a medium-weight Italian wool-blend. Single-button closure, structured shoulders, two interior pockets. Fully lined.',
    price:345, compareAtPrice:420, currency:'USD',
    images:[{url:'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=900&q=80',altText:'Tailored Blazer',width:900,height:1100}],
    variants:[
      {id:'var_007_36',title:'36 / Navy',availableForSale:true,price:345,compareAtPrice:420,selectedOptions:[{name:'Size',value:'36'},{name:'Color',value:'Navy'}]},
      {id:'var_007_38',title:'38 / Navy',availableForSale:true,price:345,compareAtPrice:420,selectedOptions:[{name:'Size',value:'38'},{name:'Color',value:'Navy'}]},
    ],
    options:[
      {id:'opt_007_s',name:'Size',values:['34','36','38','40','42']},
      {id:'opt_007_c',name:'Color',values:['Navy','Charcoal','Ivory']},
    ],
    category:'Outerwear', tags:['blazer','tailored','wool','sale'],
    rating:{rate:4.7,count:98}, inStock:true, isSale:true,
    collections:['outerwear','workwear'],
  },
  {
    id:'prod_008', handle:'cashmere-beanie', title:'Cashmere Ribbed Beanie',
    shortDescription:'Two-ply Mongolian cashmere, cozy and polished.',
    description:'Knitted from two-ply Mongolian cashmere in a classic fine rib. Slightly oversized for a relaxed fit.',
    price:95, currency:'USD',
    images:[{url:'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=900&q=80',altText:'Cashmere Beanie',width:900,height:900}],
    variants:[
      {id:'var_008_oat',title:'Oatmeal',availableForSale:true,price:95,selectedOptions:[{name:'Color',value:'Oatmeal'}]},
      {id:'var_008_blk',title:'Black',availableForSale:true,price:95,selectedOptions:[{name:'Color',value:'Black'}]},
      {id:'var_008_cam',title:'Camel',availableForSale:true,price:95,selectedOptions:[{name:'Color',value:'Camel'}]},
    ],
    options:[{id:'opt_008_c',name:'Color',values:['Oatmeal','Black','Camel','Slate']}],
    category:'Accessories', tags:['cashmere','beanie','accessories','new'],
    rating:{rate:4.8,count:267}, inStock:true, isNew:true,
    collections:['accessories'],
  },
  {
    id:'prod_009', handle:'straight-leg-jeans', title:'High-Rise Straight Jeans',
    shortDescription:'Japanese selvedge denim, raw hem, slight stretch.',
    description:'Crafted from 12oz Japanese selvedge denim with a slight stretch. High-rise waist, straight leg, raw-cut hem.',
    price:245, currency:'USD',
    images:[{url:'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=900&q=80',altText:'Straight Leg Jeans',width:900,height:1100}],
    variants:[
      {id:'var_009_24',title:'24 / Indigo',availableForSale:true,price:245,selectedOptions:[{name:'Waist',value:'24'},{name:'Wash',value:'Indigo'}]},
      {id:'var_009_26',title:'26 / Indigo',availableForSale:true,price:245,selectedOptions:[{name:'Waist',value:'26'},{name:'Wash',value:'Indigo'}]},
      {id:'var_009_28',title:'28 / Indigo',availableForSale:true,price:245,selectedOptions:[{name:'Waist',value:'28'},{name:'Wash',value:'Indigo'}]},
    ],
    options:[
      {id:'opt_009_w',name:'Waist',values:['24','26','28','30','32']},
      {id:'opt_009_wsh',name:'Wash',values:['Indigo','Black','Light Wash']},
    ],
    category:'Denim', tags:['denim','jeans','selvedge'],
    rating:{rate:4.6,count:178}, inStock:true, isBestseller:true,
    collections:['denim'],
  },
  {
    id:'prod_010', handle:'linen-shirt-dress', title:'Relaxed Linen Shirt Dress',
    shortDescription:'Oversized Belgian linen, wear belted or loose.',
    description:'An oversized shirt dress in 100% Belgian linen. Classic collar, chest patch pocket, side split at the hem.',
    price:175, currency:'USD',
    images:[{url:'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=900&q=80',altText:'Linen Shirt Dress',width:900,height:1100}],
    variants:[
      {id:'var_010_xs',title:'XS / Ecru',availableForSale:true,price:175,selectedOptions:[{name:'Size',value:'XS'},{name:'Color',value:'Ecru'}]},
      {id:'var_010_s',title:'S / Ecru',availableForSale:true,price:175,selectedOptions:[{name:'Size',value:'S'},{name:'Color',value:'Ecru'}]},
    ],
    options:[
      {id:'opt_010_s',name:'Size',values:['XS','S','M','L']},
      {id:'opt_010_c',name:'Color',values:['Ecru','Clay','Sky']},
    ],
    category:'Dresses', tags:['linen','dress','summer','new'],
    rating:{rate:4.7,count:143}, inStock:true, isNew:true,
    collections:['dresses','summer-edit'],
  },
  {
    id:'prod_011', handle:'leather-loafers', title:'Leather Penny Loafers',
    shortDescription:'Hand-welted Italian calfskin, built to last decades.',
    description:'Hand-welted in Civitanova Marche, Italy. Full-grain calfskin upper, leather sole with rubber heel tap.',
    price:425, currency:'USD',
    images:[{url:'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=900&q=80',altText:'Leather Loafers',width:900,height:900}],
    variants:[
      {id:'var_011_38',title:'38 / Cognac',availableForSale:true,price:425,selectedOptions:[{name:'Size',value:'38'},{name:'Color',value:'Cognac'}]},
      {id:'var_011_39',title:'39 / Cognac',availableForSale:true,price:425,selectedOptions:[{name:'Size',value:'39'},{name:'Color',value:'Cognac'}]},
      {id:'var_011_40',title:'40 / Cognac',availableForSale:true,price:425,selectedOptions:[{name:'Size',value:'40'},{name:'Color',value:'Cognac'}]},
    ],
    options:[
      {id:'opt_011_s',name:'Size',values:['37','38','39','40','41','42']},
      {id:'opt_011_c',name:'Color',values:['Cognac','Black']},
    ],
    category:'Shoes', tags:['leather','loafers','shoes','bestseller'],
    rating:{rate:4.9,count:89}, inStock:true, isBestseller:true,
    collections:['shoes','accessories'],
  },
  {
    id:'prod_012', handle:'linen-blazer-coord', title:'Linen Blazer Co-ord Set',
    shortDescription:'Tailored blazer + wide-leg trouser matching set.',
    description:'A relaxed linen blazer paired with matching wide-leg trousers. Both pieces work independently or together.',
    price:320, compareAtPrice:380, currency:'USD',
    images:[{url:'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=80',altText:'Linen Co-ord Set',width:900,height:1100}],
    variants:[
      {id:'var_012_xs',title:'XS / Camel',availableForSale:true,price:320,compareAtPrice:380,selectedOptions:[{name:'Size',value:'XS'},{name:'Color',value:'Camel'}]},
      {id:'var_012_s',title:'S / Camel',availableForSale:true,price:320,compareAtPrice:380,selectedOptions:[{name:'Size',value:'S'},{name:'Color',value:'Camel'}]},
    ],
    options:[
      {id:'opt_012_s',name:'Size',values:['XS','S','M','L']},
      {id:'opt_012_c',name:'Color',values:['Camel','Ecru','Slate']},
    ],
    category:'Sets', tags:['linen','co-ord','set','sale'],
    rating:{rate:4.8,count:211}, inStock:true, isSale:true,
    collections:['sets','new-arrivals'],
  },
]

export const mockReviews: Review[] = [
  {id:'rev_001',author:'Sophie M.',rating:5,title:'Worth every penny',body:'I was hesitant at the price point but this coat is truly exceptional. The cashmere is incredibly soft and drapes beautifully.',date:'2024-10-15',verified:true},
  {id:'rev_002',author:'James L.',rating:5,title:'Perfect fit, stunning quality',body:"Bought the M/Camel. The weight is just right — warm without being heavy. I'll be wearing this for decades.",date:'2024-10-08',verified:true},
  {id:'rev_003',author:'Amara K.',rating:4,title:'Beautiful but runs large',body:'Love the quality but I wish I had sized down. The XS fits more like an S/M. Still keeping it — the oversized look works.',date:'2024-09-22',verified:true},
  {id:'rev_004',author:'Clara B.',rating:5,title:'My forever coat',body:"This is genuinely the best purchase I've made in years. Timeless and incredibly versatile.",date:'2024-09-10',verified:true},
  {id:'rev_005',author:'Tom R.',rating:4,title:'Excellent quality',body:'Very happy with this. The fabric is exactly as described and the cut is flattering.',date:'2024-08-30',verified:false},
]

export const mockOrders = [
  {
    id:'ord_001', orderNumber:'Camie-10423', date:'2024-11-02', status:'delivered' as const, total:495, currency:'USD',
    items:[{id:'oi_001',title:'Cashmere Oversized Coat',variant:'M / Camel',quantity:1,price:495,image:'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=200&q=80'}],
  },
  {
    id:'ord_002', orderNumber:'Camie-10289', date:'2024-10-14', status:'delivered' as const, total:350, currency:'USD',
    items:[
      {id:'oi_002',title:'Merino Turtleneck Sweater',variant:'S / Oatmeal',quantity:1,price:165,image:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&q=80'},
      {id:'oi_003',title:'Ribbed Modal Tank',variant:'S / White',quantity:1,price:65,image:'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=200&q=80'},
      {id:'oi_004',title:'Cashmere Ribbed Beanie',variant:'Oatmeal',quantity:1,price:95,image:'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=200&q=80'},
    ],
  },
  {
    id:'ord_003', orderNumber:'Camie-10154', date:'2024-09-05', status:'processing' as const, total:285, currency:'USD',
    items:[{id:'oi_005',title:'Silk Slip Dress',variant:'S / Champagne',quantity:1,price:285,image:'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=200&q=80'}],
  },
]

export const CATEGORIES = [
  'All','Outerwear','Dresses','Knitwear','Tops','Trousers','Denim','Bags','Shoes','Accessories','Sets'
]

export const HERO_BANNERS = [
  {
    id:1, badge:'New Collection SS25',
    title:'Dress with\nintention.',
    subtitle:'Considered pieces for a considered wardrobe.',
    cta:'Shop Now', ctaSecondary:'Explore Collections',
    href:'/shop',
    image:'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1600&q=80',
  },
  {
    id:2, badge:'Knitwear Edit',
    title:'Warm,\nnot heavy.',
    subtitle:'Extra-fine merino and cashmere — from $95.',
    cta:'Shop Knitwear', ctaSecondary:'View All',
    href:'/collections/knitwear',
    image:'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1600&q=80',
  },
  {
    id:3, badge:'Up to 30% Off',
    title:'End of season\nsale.',
    subtitle:'Selected styles reduced. While stocks last.',
    cta:'Shop Sale', ctaSecondary:"See What's New",
    href:'/shop',
    image:'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80',
  },
]

// ✅ FIXED: hrefs now point to /collections/[handle]
export const COLLECTION_HIGHLIGHTS = [
  {id:'outerwear',  label:'Outerwear',   image:'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80',  href:'/collections/outerwear'},
  {id:'dresses',    label:'Dresses',     image:'https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&q=80',  href:'/collections/dresses'},
  {id:'knitwear',   label:'Knitwear',    image:'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80',  href:'/collections/knitwear'},
  {id:'accessories',label:'Accessories', image:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',     href:'/collections/accessories'},
]
