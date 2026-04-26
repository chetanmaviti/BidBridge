import type { NaicsCode } from "./types";

/**
 * Subset of the official NAICS 2022 catalog covering common
 * small-business federal contracting industries. Includes the
 * demo hero code 322220 (Paper Bag and Coated/Treated Paper Mfg).
 *
 * Expand as needed. The full 2022 catalog is ~1,057 entries.
 */
export const NAICS_CATALOG: NaicsCode[] = [
  // Manufacturing — packaging, printing, food
  { code: "322220", title: "Paper Bag and Coated and Treated Paper Manufacturing", description: "Coating, laminating, or treating paper; manufacturing paper bags and similar paper-based containers." },
  { code: "323111", title: "Commercial Printing (except Screen and Books)", description: "Lithographic, gravure, flexographic, letterpress, and digital printing for commercial customers." },
  { code: "323113", title: "Commercial Screen Printing", description: "Screen printing on apparel, signage, and other surfaces." },
  { code: "311999", title: "All Other Miscellaneous Food Manufacturing", description: "Manufacturing food products not elsewhere classified — specialty, ethnic, perishable foods." },
  { code: "311941", title: "Mayonnaise, Dressing, and Other Prepared Sauce Manufacturing", description: "Production of mayonnaise, salad dressings, prepared sauces, and seasonings." },
  { code: "332710", title: "Machine Shops", description: "Machining metal and plastic parts on a job- or order-basis." },
  { code: "333318", title: "Other Commercial and Service Industry Machinery Manufacturing", description: "Manufacturing commercial and service-industry machinery not elsewhere classified." },
  { code: "339999", title: "All Other Miscellaneous Manufacturing", description: "Manufacturing of products not elsewhere classified." },
  { code: "315240", title: "Apparel Manufacturing — Cut and Sew", description: "Cut-and-sew of women's, girls', men's, and boys' apparel." },

  // Construction
  { code: "236220", title: "Commercial and Institutional Building Construction", description: "General contractors building commercial, institutional, and industrial structures." },
  { code: "237110", title: "Water and Sewer Line and Related Structures Construction", description: "Construction of water/sewer lines, mains, pumping stations, treatment plants." },
  { code: "237310", title: "Highway, Street, and Bridge Construction", description: "Construction of highways, roads, streets, bridges, and tunnels." },
  { code: "238210", title: "Electrical Contractors and Other Wiring Installation Contractors", description: "Installing and servicing electrical wiring and equipment." },
  { code: "238220", title: "Plumbing, Heating, and Air-Conditioning Contractors", description: "Installing and servicing plumbing, heating, and HVAC systems." },
  { code: "238110", title: "Poured Concrete Foundation and Structure Contractors", description: "Pouring concrete foundations, slabs, and structural elements." },

  // IT services / software
  { code: "541511", title: "Custom Computer Programming Services", description: "Writing, modifying, testing, and supporting software to meet customer specifications." },
  { code: "541512", title: "Computer Systems Design Services", description: "Planning and designing integrated computer systems combining hardware, software, and communications." },
  { code: "541513", title: "Computer Facilities Management Services", description: "Providing on-site management and operation of clients' computer systems and data processing facilities." },
  { code: "541519", title: "Other Computer Related Services", description: "Computer-related services not elsewhere classified — disaster recovery, software installation." },
  { code: "518210", title: "Data Processing, Hosting, and Related Services", description: "Hosting infrastructure for client data, web hosting, application service provisioning, streaming." },
  { code: "541690", title: "Other Scientific and Technical Consulting Services", description: "Consulting in agriculture, biology, chemistry, energy, environmental, and other technical disciplines." },

  // Professional services — consulting
  { code: "541611", title: "Administrative Management and General Management Consulting Services", description: "Consulting on strategic and organizational planning, financial planning, marketing, human resources." },
  { code: "541612", title: "Human Resources Consulting Services", description: "Consulting on HR policy, compensation, benefits, training, and employee assistance programs." },
  { code: "541613", title: "Marketing Consulting Services", description: "Consulting on marketing objectives, sales forecasts, advertising, distribution channels." },
  { code: "541618", title: "Other Management Consulting Services", description: "Management consulting not elsewhere classified — telecom, logistics, manufacturing operations." },
  { code: "541620", title: "Environmental Consulting Services", description: "Consulting on environmental issues — site assessment, remediation, compliance, conservation." },
  { code: "541330", title: "Engineering Services", description: "Applying physical laws and engineering principles to design buildings, machinery, processes, systems." },
  { code: "541310", title: "Architectural Services", description: "Planning and designing of residential, institutional, leisure, commercial, and industrial buildings." },
  { code: "541211", title: "Offices of Certified Public Accountants", description: "Auditing financial records, designing accounting systems, preparing financial statements." },
  { code: "541219", title: "Other Accounting Services", description: "Bookkeeping, billing, payroll processing, tax preparation other than CPAs." },
  { code: "541810", title: "Advertising Agencies", description: "Creating advertising campaigns and placing them in media — print, broadcast, digital, outdoor." },
  { code: "541910", title: "Marketing Research and Public Opinion Polling", description: "Systematically gathering, recording, and analyzing data on consumer or market behavior." },
  { code: "541715", title: "R&D in the Physical, Engineering, and Life Sciences (except Nanotechnology and Biotechnology)", description: "Conducting research and experimental development in the physical, engineering, and life sciences." },
  { code: "541990", title: "All Other Professional, Scientific, and Technical Services", description: "Professional services not elsewhere classified — appraisal, weather forecasting, language services." },

  // Facilities / janitorial / security / staffing
  { code: "561110", title: "Office Administrative Services", description: "Day-to-day office administrative services — financial planning, billing, personnel, mail." },
  { code: "561210", title: "Facilities Support Services", description: "Combination of support services such as janitorial, maintenance, trash disposal, security." },
  { code: "561320", title: "Temporary Help Services", description: "Supplying workers to clients' businesses for limited periods to supplement client workforce." },
  { code: "561612", title: "Security Guards and Patrol Services", description: "Providing guard and patrol services such as bodyguards, watch patrol, armored car." },
  { code: "561720", title: "Janitorial Services", description: "Cleaning building interiors, exteriors, windows, and customers' premises." },
  { code: "561730", title: "Landscaping Services", description: "Landscape care and maintenance, lawn care, ornamental tree services, landscape installation." },
  { code: "561790", title: "Other Services to Buildings and Dwellings", description: "Services to buildings and dwellings not elsewhere classified — exterminating, gutter cleaning." },
  { code: "562111", title: "Solid Waste Collection", description: "Collecting nonhazardous solid waste — refuse, recyclables — from a local area." },
  { code: "561990", title: "All Other Support Services", description: "Support services not elsewhere classified — bartending, swimming pool cleaning, court reporting." },

  // Wholesale
  { code: "423430", title: "Computer and Computer Peripheral Equipment and Software Merchant Wholesalers", description: "Wholesaling computers, peripheral equipment, and prepackaged software." },
  { code: "423610", title: "Electrical Apparatus and Equipment, Wiring Supplies Wholesalers", description: "Wholesaling electrical apparatus and equipment, wiring supplies, electrical construction materials." },
  { code: "423990", title: "Other Miscellaneous Durable Goods Merchant Wholesalers", description: "Wholesaling durable goods not elsewhere classified — fire extinguishers, safety equipment, monuments." },

  // Transportation / logistics
  { code: "484110", title: "General Freight Trucking, Local", description: "Providing local general freight trucking — typically within a single metropolitan area." },
  { code: "484121", title: "General Freight Trucking, Long-Distance, Truckload", description: "Long-distance general freight trucking primarily on a truckload basis." },
  { code: "488510", title: "Freight Transportation Arrangement", description: "Arranging transportation of freight between shippers and carriers — freight forwarders, customs brokers." },
  { code: "493110", title: "General Warehousing and Storage", description: "Operating merchandise warehousing and storage facilities — general merchandise, refrigerated goods." },

  // Healthcare
  { code: "621399", title: "Offices of All Other Miscellaneous Health Practitioners", description: "Health practitioners not elsewhere classified — naturopaths, hypnotherapists, midwives." },
  { code: "621610", title: "Home Health Care Services", description: "Skilled nursing, personal care, homemaker, and companion services in the patient's home." },
];

export function findNaics(code: string): NaicsCode | undefined {
  return NAICS_CATALOG.find((n) => n.code === code);
}

export function searchNaics(query: string, limit = 10): NaicsCode[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return NAICS_CATALOG.filter(
    (n) =>
      n.code.includes(q) ||
      n.title.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q)
  ).slice(0, limit);
}
