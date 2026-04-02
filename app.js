const { useState, useEffect, useMemo, useCallback } = React;

// --- Configuración y Traducciones ---

const TERM_TRANSLATIONS = {
    "woody": "Amaderado", "citrus": "Cítrico", "floral": "Floral", "amber": "Ámbar",
    "spicy": "Especiado", "fresh": "Fresco", "musky": "Almizclado", "fruity": "Afrutado",
    "aromatic": "Aromático", "green": "Verde", "powdery": "Atalcado", "sweet": "Dulce",
    "vanilla": "Vainilla", "earthy": "Terroso", "rose": "Rosa", "white floral": "Floral Blanco",
    "balsamic": "Balsámico", "leather": "Cuero", "oud": "Oud", "tobacco": "Tabaco",
    "smoky": "Ahumado", "aquatic": "Acuático", "marine": "Marino", "ozonic": "Ozónico",
    "tropical": "Tropical", "animalic": "Animal", "herbal": "Herbal", "mossy": "Musgoso",
    "warm spicy": "Especiado Cálido", "fresh spicy": "Especiado Fresco", "soft spicy": "Especiado Suave",
    "patchouli": "Pachulí", "iris": "Iris", "violet": "Violeta", "lavender": "Lavanda",
    "bergamot": "Bergamota", "lemon": "Limón", "orange": "Naranja", "mandarin": "Mandarina",
    "grapefruit": "Pomelo", "lime": "Lima", "apple": "Manzana", "pear": "Pera",
    "peach": "Melocotón", "black currant": "Grosella Negra", "pineapple": "Piña",
    "coconut": "Coco", "jasmine": "Jazmín", "tuberose": "Nardo", "lily": "Lirio",
    "ylang-ylang": "Ylang-Ylang", "geranium": "Geranio", "neroli": "Neroli",
    "sandalwood": "Sándalo", "cedar": "Cedro", "vetiver": "Vetiver", "oakmoss": "Musgo de Roble",
    "tonka bean": "Haba Tonka", "cinnamon": "Canela", "cardamom": "Cardamomo",
    "ginger": "Jengibre", "pepper": "Pimienta", "clove": "Clavo", "nutmeg": "Nuez Moscada",
    "saffron": "Azafrán", "honey": "Miel", "coffee": "Café", "chocolate": "Chocolate",
    "almond": "Almendra", "mint": "Menta", "basil": "Albahaca", "sage": "Salvia",
    "rosemary": "Romero", "thyme": "Tomillo", "incense": "Incienso", "myrrh": "Mirra",
    "benzoin": "Benjuí", "labdanum": "Ládano", "rum": "Ron", "cognac": "Coñac"
};

const TRANSLATIONS = {
    gender: {
        "men": "Hombre", "women": "Mujer", "women and men": "Unisex",
        "more male": "Más Masculino", "more female": "Más Femenino",
        "male": "Masculino", "female": "Femenino", "unisex": "Unisex"
    },
    price: {
        "way overpriced": "Muy Caro", "overpriced": "Caro", "ok": "Precio Justo",
        "good value": "Buen Valor", "great value": "Gran Valor"
    },
    longevity: {
        "very weak": "Muy Débil", "weak": "Débil", "moderate": "Moderada",
        "long lasting": "Duradera", "eternal": "Eterna"
    },
    sillage: {
        "intimate": "Íntima", "moderate": "Moderada", "strong": "Fuerte", "enormous": "Enorme"
    }
};

const PRICE_ORDER = ["Gran Valor", "Buen Valor", "Precio Justo", "Caro", "Muy Caro"];
const SILLAGE_ORDER = ["Íntima", "Moderada", "Fuerte", "Enorme"];
const LONGEVITY_ORDER = ["Muy Débil", "Débil", "Moderada", "Duradera", "Eterna"];

// --- Helpers ---

const translate = (category, value) => {
    if (!value) return "Desconocido";
    const lowerVal = String(value).toLowerCase();
    return TRANSLATIONS[category]?.[lowerVal] || value;
};

const normalizeText = (text) => {
    if (!text) return "";
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const translateText = (text) => {
    if (!text) return "";
    return text.split(/,\s*/).map(part => {
        const lower = part.toLowerCase().trim();
        if (TERM_TRANSLATIONS[lower]) return TERM_TRANSLATIONS[lower];
        for (const [eng, esp] of Object.entries(TERM_TRANSLATIONS)) {
            if (lower.includes(eng)) {
                return part.replace(new RegExp(eng, 'gi'), esp);
            }
        }
        return part;
    }).join(", ");
};

const formatNumber = (num) => new Intl.NumberFormat('es-ES').format(num || 0);

// --- Componentes Atómicos ---

const Icon = ({ name, size = 24, className = "" }) => {
    return <i data-lucide={name} width={size} height={size} className={className}></i>;
};

const KPICard = ({ title, value, iconName, color }) => (
    <div className="glass-panel p-6 rounded-xl card-hover relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-${color}-500/10 transition-colors`}></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</h3>
            <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
                <Icon name={iconName} size={18} />
            </div>
        </div>
        <div className="text-3xl font-extrabold text-white relative z-10 tracking-tight">{value}</div>
    </div>
);

const SimpleBarChart = ({ data, color = "emerald" }) => {
    if (!data || data.length === 0) return <div className="text-slate-500 italic">No hay datos disponibles</div>;

    const maxVal = Math.max(...data.map(d => d.value));
    return (
        <div className="space-y-4">
            {data.map((d, i) => (
                <div key={i} className="space-y-1 group">
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium group-hover:text-white transition-colors truncate pr-4" title={d.name}>{d.name}</span>
                        <span className="text-slate-500 font-mono">{formatNumber(d.value)}</span>
                    </div>
                    <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/30">
                        <div
                            className={`h-full bg-${color}-500 rounded-full transition-all duration-1000 ease-out group-hover:brightness-110`}
                            style={{ width: `${(d.value / maxVal) * 100}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- Dashboard Component ---

const Dashboard = ({ data }) => {
    const stats = useMemo(() => {
        const total = data.length;
        const brands = new Set(data.map(d => d.marca)).size;
        const avgRating = (data.reduce((acc, curr) => acc + (curr.rating || 0), 0) / total).toFixed(2);

        const getCounts = (key, translator, order) => {
            const counts = {};
            data.forEach(d => {
                const val = translator ? translate(translator, d[key]) : d[key];
                counts[val] = (counts[val] || 0) + 1;
            });
            let res = Object.entries(counts).map(([name, value]) => ({ name, value }));
            if (order) {
                res.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));
            } else {
                res.sort((a, b) => b.value - a.value);
            }
            return res;
        };

        const genderData = getCounts('genero', 'gender');
        const priceData = getCounts('precio', 'price', PRICE_ORDER);
        const topBrands = getCounts('marca').slice(0, 5);

        // Top Rated con filtro de votos
        const topRated = data
            .filter(d => (d.num_votos || 0) > 100)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);

        return { total, brands, avgRating, genderData, priceData, topBrands, topRated };
    }, [data]);

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="Fragancias" value={formatNumber(stats.total)} iconName="droplet" color="indigo" />
                <KPICard title="Marcas" value={formatNumber(stats.brands)} iconName="award" color="pink" />
                <KPICard title="Rating Medio" value={stats.avgRating} iconName="star" color="yellow" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
                        <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                        Distribución por Género
                    </h3>
                    <SimpleBarChart data={stats.genderData} color="indigo" />
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
                        <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                        Relación Calidad/Precio
                    </h3>
                    <SimpleBarChart data={stats.priceData} color="emerald" />
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
                        <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                        Top Marcas en Catálogo
                    </h3>
                    <SimpleBarChart data={stats.topBrands} color="amber" />
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-3">
                        <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
                        Mejor Valoradas (+100 votos)
                    </h3>
                    <div className="space-y-4">
                        {stats.topRated.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700/50">
                                <div className="min-w-0">
                                    <div className="font-bold text-white truncate text-sm">{item.nombre_completo}</div>
                                    <div className="text-xs text-slate-500">{item.marca}</div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <span className="text-yellow-400 font-black">{item.rating}</span>
                                    <Icon name="star" size={14} className="text-yellow-400 fill-current" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Explorer Component ---

const FilterSection = ({ title, children, isOpen = true }) => {
    const [open, setOpen] = useState(isOpen);
    return (
        <div className="border-b border-slate-700/50 py-4 last:border-0">
            <button
                className="flex items-center justify-between w-full text-left mb-3 group"
                onClick={() => setOpen(!open)}
            >
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-indigo-400 transition-colors">{title}</h4>
                <Icon name={open ? "minus" : "plus"} size={14} className="text-slate-600 group-hover:text-indigo-400" />
            </button>
            {open && <div className="space-y-2 animate-fade-in">{children}</div>}
        </div>
    );
};

const CheckboxList = ({ options, selected, onChange, search = false }) => {
    const [term, setTerm] = useState("");
    const filteredOptions = useMemo(() => {
        if (!search) return options;
        const nTerm = normalizeText(term);
        return options.filter(o => normalizeText(o.label).includes(nTerm));
    }, [options, term, search]);

    return (
        <div className="space-y-2">
            {search && (
                <input
                    type="text"
                    placeholder="Filtrar..."
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-indigo-500 outline-none transition-all"
                    value={term}
                    onChange={e => setTerm(e.target.value)}
                />
            )}
            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1 pr-2">
                {filteredOptions.length > 0 ? filteredOptions.map(opt => (
                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selected.includes(opt.value) ? 'bg-indigo-500 border-indigo-500 scale-110' : 'border-slate-600 group-hover:border-slate-400'}`}>
                            {selected.includes(opt.value) && <Icon name="check" size={12} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={selected.includes(opt.value)} onChange={() => onChange(opt.value)} />
                        <span className={`text-xs truncate ${selected.includes(opt.value) ? 'text-white font-bold' : 'text-slate-400 group-hover:text-slate-200'}`}>
                            {opt.label} <span className="text-[10px] text-slate-600 ml-1 font-mono">({opt.count})</span>
                        </span>
                    </label>
                )) : <div className="text-[10px] text-slate-600 italic p-2">Sin coincidencias</div>}
            </div>
        </div>
    );
};

const Explorer = ({ data, onViewDetails }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    // Estados de Filtros
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [selectedGenders, setSelectedGenders] = useState([]);
    const [selectedPrices, setSelectedPrices] = useState([]);
    const [minRating, setMinRating] = useState(0);

    const itemsPerPage = 20;

    // Generar opciones de filtros
    const filterOptions = useMemo(() => {
        const brands = {}; const genders = {}; const prices = {};
        data.forEach(item => {
            const b = item.marca || "Otros"; brands[b] = (brands[b] || 0) + 1;
            const g = translate('gender', item.genero); genders[g] = (genders[g] || 0) + 1;
            const p = translate('price', item.precio); prices[p] = (prices[p] || 0) + 1;
        });

        const toOpts = (obj, order) => Object.entries(obj)
            .map(([k, v]) => ({ value: k, label: k, count: v }))
            .sort((a, b) => order ? order.indexOf(a.value) - order.indexOf(b.value) : b.count - a.count);

        return {
            brands: toOpts(brands),
            genders: toOpts(genders),
            prices: toOpts(prices, PRICE_ORDER)
        };
    }, [data]);

    const filteredData = useMemo(() => {
        const nSearch = normalizeText(searchTerm);
        return data.filter(item => {
            const matchesSearch = !searchTerm || (
                normalizeText(item.nombre_completo).includes(nSearch) ||
                normalizeText(item.marca).includes(nSearch) ||
                normalizeText(item.main_accords).includes(nSearch)
            );
            const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(item.marca);
            const matchesGender = selectedGenders.length === 0 || selectedGenders.includes(translate('gender', item.genero));
            const matchesPrice = selectedPrices.length === 0 || selectedPrices.includes(translate('price', item.precio));
            const matchesRating = (item.rating || 0) >= minRating;

            return matchesSearch && matchesBrand && matchesGender && matchesPrice && matchesRating;
        });
    }, [data, searchTerm, selectedBrands, selectedGenders, selectedPrices, minRating]);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, page]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const toggleFilter = (setter, value) => {
        setter(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
        setPage(1);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 animate-fade-in lg:h-[calc(100vh-160px)]">
            {/* Sidebar de Filtros */}
            <aside className={`lg:w-80 flex-shrink-0 z-30 transition-all duration-300 
                ${showFilters ? 'fixed inset-0 bg-slate-900 p-6 overflow-y-auto' : 'hidden lg:block'}`}>
                
                <div className="flex justify-between items-center mb-6 lg:hidden">
                    <h3 className="text-xl font-black">FILTROS</h3>
                    <button onClick={() => setShowFilters(false)} className="p-2 bg-slate-800 rounded-full"><Icon name="x" /></button>
                </div>

                <div className="glass-panel p-6 rounded-2xl h-full overflow-y-auto custom-scrollbar border border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-black tracking-widest text-indigo-400">FILTRAR POR</h3>
                        {(selectedBrands.length + selectedGenders.length + selectedPrices.length + (minRating > 0 ? 1 : 0)) > 0 && (
                            <button onClick={() => { setSelectedBrands([]); setSelectedGenders([]); setSelectedPrices([]); setMinRating(0); }} className="text-[10px] text-slate-500 hover:text-white underline">Limpiar</button>
                        )}
                    </div>

                    <FilterSection title="Rating Mínimo">
                        <input type="range" min="0" max="5" step="0.5" value={minRating} onChange={e => setMinRating(parseFloat(e.target.value))} className="w-full accent-indigo-500 mb-2" />
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>0.0</span>
                            <span className="text-indigo-400 font-bold">{minRating.toFixed(1)} ★</span>
                            <span>5.0</span>
                        </div>
                    </FilterSection>

                    <FilterSection title="Género">
                        <CheckboxList options={filterOptions.genders} selected={selectedGenders} onChange={v => toggleFilter(setSelectedGenders, v)} />
                    </FilterSection>

                    <FilterSection title="Precio">
                        <CheckboxList options={filterOptions.prices} selected={selectedPrices} onChange={v => toggleFilter(setSelectedPrices, v)} />
                    </FilterSection>

                    <FilterSection title="Marca" isOpen={false}>
                        <CheckboxList options={filterOptions.brands} selected={selectedBrands} onChange={v => toggleFilter(setSelectedBrands, v)} search={true} />
                    </FilterSection>
                </div>
            </aside>

            {/* Contenido Principal */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="flex gap-3 mb-6">
                    <div className="relative flex-1 group">
                        <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar fragancia, marca, notas..."
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 focus:bg-slate-800 transition-all"
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>
                    <button onClick={() => setShowFilters(true)} className="lg:hidden p-4 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20"><Icon name="filter" size={20} /></button>
                </div>

                <div className="glass-panel rounded-3xl flex-1 flex flex-col overflow-hidden border border-white/5 shadow-2xl">
                    <div className="table-responsive flex-1 custom-scrollbar">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-slate-800/80 backdrop-blur sticky top-0 z-20">
                                <tr>
                                    <th className="p-5 text-[10px] font-black text-slate-500 tracking-widest uppercase">Fragancia</th>
                                    <th className="p-5 text-[10px] font-black text-slate-500 tracking-widest uppercase">Marca</th>
                                    <th className="p-5 text-[10px] font-black text-slate-500 tracking-widest uppercase hidden sm:table-cell text-center">Género</th>
                                    <th className="p-5 text-[10px] font-black text-slate-500 tracking-widest uppercase">Valoración</th>
                                    <th className="p-5 text-[10px] font-black text-slate-500 tracking-widest uppercase">Precio</th>
                                    <th className="p-5 w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {paginatedData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-indigo-500/[0.03] transition-colors group cursor-pointer" onClick={() => onViewDetails(item)}>
                                        <td className="p-5">
                                            <div className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">{item.nombre_completo}</div>
                                        </td>
                                        <td className="p-5 text-slate-400 text-sm">{item.marca}</td>
                                        <td className="p-5 hidden sm:table-cell text-center">
                                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                                                ${translate('gender', item.genero) === 'Mujer' ? 'bg-pink-500/10 text-pink-400' :
                                                translate('gender', item.genero) === 'Hombre' ? 'bg-blue-500/10 text-blue-400' :
                                                'bg-indigo-500/10 text-indigo-400'}`}>
                                                {translate('gender', item.genero)}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-yellow-500 text-sm">{item.rating}</span>
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Icon key={i} name="star" size={10} className={`${i < Math.floor(item.rating) ? 'text-yellow-500 fill-current' : 'text-slate-700'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] text-slate-600 font-mono ml-1">({formatNumber(item.num_votos)})</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-slate-300 text-sm font-medium">{translate('price', item.precio)}</td>
                                        <td className="p-5 text-right">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                <Icon name="chevron-right" size={16} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredData.length === 0 && (
                            <div className="p-20 text-center">
                                <Icon name="search-x" size={48} className="mx-auto mb-4 text-slate-700" />
                                <p className="text-slate-500 font-medium">No hay resultados para tu búsqueda</p>
                            </div>
                        )}
                    </div>

                    {/* Paginación */}
                    <div className="p-6 bg-slate-800/30 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-slate-500 font-medium order-2 sm:order-1">
                            Mostrando <span className="text-white">{formatNumber(paginatedData.length)}</span> de <span className="text-white">{formatNumber(filteredData.length)}</span> fragancias
                        </div>
                        <div className="flex items-center gap-2 order-1 sm:order-2">
                            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl disabled:opacity-30 transition-colors"><Icon name="chevron-left" size={20} /></button>
                            <div className="px-4 py-2 bg-slate-800 rounded-xl text-xs font-bold text-indigo-400 border border-indigo-500/20">
                                {page} / {totalPages || 1}
                            </div>
                            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl disabled:opacity-30 transition-colors"><Icon name="chevron-right" size={20} /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Modal de Detalles ---

const DetailModal = ({ item, onClose }) => {
    if (!item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900 border border-white/10 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] custom-scrollbar" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-slate-900/90 backdrop-blur-md border-b border-white/5 p-6 sm:p-10 flex justify-between items-start z-10">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-indigo-500 text-white text-[10px] font-black uppercase rounded-lg shadow-lg shadow-indigo-500/20">{item.marca}</span>
                            {item.rating > 4.5 && <span className="flex items-center gap-1 text-yellow-500 text-[10px] font-black uppercase tracking-wider"><Icon name="award" size={12} /> TOP RATED</span>}
                        </div>
                        <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight break-words">{item.nombre_completo}</h2>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-800 hover:bg-red-500/20 hover:text-red-400 rounded-2xl transition-all"><Icon name="x" size={24} /></button>
                </div>

                <div className="p-6 sm:p-10 space-y-12">
                    {/* Stats Premium */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Valoración', val: item.rating, sub: `${formatNumber(item.num_votos)} votos`, icon: 'star', color: 'yellow' },
                            { label: 'Duración', val: translate('longevity', item.longevidad), pct: item.longevidad_pct, icon: 'clock', color: 'indigo' },
                            { label: 'Estela', val: translate('sillage', item.estela), pct: item.estela_pct, icon: 'wind', color: 'pink' },
                            { label: 'Precio', val: translate('price', item.precio), pct: item.precio_pct, icon: 'dollar-sign', color: 'emerald' }
                        ].map((s, i) => (
                            <div key={i} className="bg-slate-800/30 border border-white/5 p-6 rounded-3xl group hover:border-indigo-500/30 transition-colors">
                                <div className={`text-${s.color}-400 mb-4 bg-${s.color}-500/10 w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <Icon name={s.icon} size={20} />
                                </div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</div>
                                <div className="text-lg font-black text-white mb-2">{s.val}</div>
                                {s.pct !== undefined ? (
                                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                        <div className={`h-full bg-${s.color}-500 transition-all duration-1000 delay-300`} style={{ width: `${s.pct * 100}%` }}></div>
                                    </div>
                                ) : <div className="text-xs text-slate-500 font-mono">{s.sub}</div>}
                            </div>
                        ))}
                    </div>

                    {/* Pirámide Olfativa */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        {[
                            { title: 'Notas de Salida', text: item.notas_salida, color: 'indigo', icon: 'zap' },
                            { title: 'Notas de Corazón', text: item.notas_corazon, color: 'pink', icon: 'heart' },
                            { title: 'Notas de Fondo', text: item.notas_fondo, color: 'amber', icon: 'anchor' }
                        ].map((n, i) => n.text && (
                            <div key={i} className="relative p-8 rounded-[2rem] bg-slate-800/20 border border-white/5 overflow-hidden group">
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-${n.color}-500/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-${n.color}-500/10 transition-colors`}></div>
                                <div className={`flex items-center gap-3 mb-6 text-${n.color}-400`}>
                                    <Icon name={n.icon} size={20} />
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em]">{n.title}</h4>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed relative z-10">{translateText(n.text)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Acordes */}
                    <div className="bg-slate-800/10 p-10 rounded-[2.5rem] border border-white/5">
                        <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mb-8 text-center">Acordes Principales</h3>
                        <div className="flex flex-wrap justify-center gap-3">
                            {String(item.main_accords || "").split(',').map((accord, idx) => (
                                <span key={idx} className="px-6 py-2 bg-slate-800 border border-white/5 hover:border-indigo-500/50 hover:bg-slate-700 transition-all rounded-full text-xs font-bold text-slate-300">
                                    {translateText(accord.trim())}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Aplicación Principal ---

const App = () => {
    const [data, setData] = useState(null);
    const [view, setView] = useState('dashboard');
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        if (window.FRAGRANCE_DATA) setData(window.FRAGRANCE_DATA);
    }, []);

    useEffect(() => {
        if (window.lucide) window.lucide.createIcons();
    }, [data, view, selectedItem]);

    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-8 animate-bounce">
                    <Icon name="droplet" size={40} className="text-white" />
                </div>
                <h1 className="text-3xl font-black text-white mb-2 tracking-tighter italic">FRAGRANCE EXPLORER</h1>
                <p className="text-slate-500 font-mono text-xs uppercase tracking-widest animate-pulse">Iniciando sistema de análisis...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
            {/* Header / Navbar */}
            <header className="bg-slate-950/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setView('dashboard')}>
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Icon name="droplet" size={24} className="text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <div className="font-black text-xl tracking-tighter leading-none text-white">FRAGRANCE</div>
                            <div className="text-[10px] font-black tracking-[0.4em] text-indigo-400 leading-none">EXPLORER</div>
                        </div>
                    </div>

                    <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: 'layout' },
                            { id: 'explorer', label: 'Explorador', icon: 'search' }
                        ].map(btn => (
                            <button
                                key={btn.id}
                                onClick={() => setView(btn.id)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${view === btn.id ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-200'}`}
                            >
                                <Icon name={btn.icon} size={14} />
                                <span className="hidden xs:block">{btn.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-6 py-10 overflow-hidden">
                {view === 'dashboard' ? <Dashboard data={data} /> : <Explorer data={data} onViewDetails={setSelectedItem} />}
            </main>

            {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
