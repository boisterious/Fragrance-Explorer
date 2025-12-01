const { useState, useEffect, useMemo } = React;
const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } = Recharts;
const { Search, Filter, Droplet, Star, Clock, Wind, DollarSign, ChevronRight, X, LayoutGrid, List } = lucide;

// --- Components ---

const FileUploader = ({ onDataLoaded }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFile = async (file) => {
        setLoading(true);
        setError(null);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Custom header parsing to handle potential issues
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            if (!jsonData || jsonData.length === 0) {
                throw new Error("No data found in the Excel file.");
            }

            onDataLoaded(jsonData);
        } catch (err) {
            console.error(err);
            setError("Error reading file: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const onDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-4">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500 mb-4">
                    Fragrance Explorer
                </h1>
                <p className="text-slate-400 text-lg">Professional Data Analysis & Discovery Tool</p>
            </div>

            <div
                className={`w-full max-w-2xl h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer
                    ${isDragging ? 'border-indigo-500 bg-indigo-500/10 scale-105' : 'border-slate-600 hover:border-indigo-400 hover:bg-slate-800/50'}
                `}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => document.getElementById('fileInput').click()}
            >
                <input
                    type="file"
                    id="fileInput"
                    className="hidden"
                    accept=".xlsx, .xls"
                    onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                />

                {loading ? (
                    <div className="flex flex-col items-center animate-pulse">
                        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-indigo-400 font-medium">Processing Data...</p>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-indigo-400">
                            <i data-lucide="upload-cloud" className="w-8 h-8"></i>
                        </div>
                        <p className="text-xl font-medium text-slate-200 mb-2">Drop your Excel file here</p>
                        <p className="text-sm text-slate-500">or click to browse (fragancias_completo.xlsx)</p>
                    </>
                )}
            </div>

            {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-center">
                    <i data-lucide="alert-circle" className="w-5 h-5 mr-2"></i>
                    {error}
                </div>
            )}
        </div>
    );
};

const KPICard = ({ title, value, icon, color }) => (
    <div className="glass-panel p-6 rounded-xl card-hover">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
            <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-400`}>
                {icon}
            </div>
        </div>
        <div className="text-3xl font-bold text-white">{value}</div>
    </div>
);

const Dashboard = ({ data }) => {
    const stats = useMemo(() => {
        const total = data.length;
        const brands = new Set(data.map(d => d.marca)).size;
        const avgRating = (data.reduce((acc, curr) => acc + (curr.rating || 0), 0) / total).toFixed(2);

        // Gender Distribution
        const genderCounts = {};
        data.forEach(d => {
            const g = d.genero || 'Unknown';
            genderCounts[g] = (genderCounts[g] || 0) + 1;
        });
        const genderData = Object.entries(genderCounts).map(([name, value]) => ({ name, value }));

        // Price Distribution
        const priceCounts = {};
        data.forEach(d => {
            const p = d.precio || 'Unknown';
            priceCounts[p] = (priceCounts[p] || 0) + 1;
        });
        const priceData = Object.entries(priceCounts).map(([name, value]) => ({ name, value }));

        return { total, brands, avgRating, genderData, priceData };
    }, [data]);

    const COLORS = ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#a78bfa'];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="Total Fragrances" value={stats.total.toLocaleString()} icon={<Droplet size={20} />} color="indigo" />
                <KPICard title="Unique Brands" value={stats.brands.toLocaleString()} icon={<Star size={20} />} color="pink" />
                <KPICard title="Average Rating" value={stats.avgRating} icon={<Star size={20} />} color="yellow" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-6">Gender Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.genderData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-6">Price Value Perception</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.priceData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    cursor={{ fill: '#334155', opacity: 0.2 }}
                                />
                                <Bar dataKey="value" fill="#34d399" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Explorer = ({ data, onViewDetails }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const itemsPerPage = 20;

    const filteredData = useMemo(() => {
        return data.filter(item => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (item.nombre_completo && item.nombre_completo.toLowerCase().includes(searchLower)) ||
                (item.marca && item.marca.toLowerCase().includes(searchLower)) ||
                (item.main_accords && item.main_accords.toLowerCase().includes(searchLower))
            );
        });
    }, [data, searchTerm]);

    const paginatedData = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, page]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search fragrances, brands, accords..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs font-semibold">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Brand</th>
                                <th className="p-4">Gender</th>
                                <th className="p-4">Rating</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {paginatedData.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 font-medium text-white">{item.nombre_completo}</td>
                                    <td className="p-4 text-slate-300">{item.marca}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                            ${item.genero === 'women' ? 'bg-pink-500/10 text-pink-400' :
                                                item.genero === 'men' ? 'bg-blue-500/10 text-blue-400' :
                                                    'bg-purple-500/10 text-purple-400'}`}>
                                            {item.genero}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center text-yellow-400">
                                            <span className="font-bold mr-1">{item.rating}</span>
                                            <Star size={14} fill="currentColor" />
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-300">{item.precio}</td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => onViewDetails(item)}
                                            className="p-2 hover:bg-indigo-500/20 rounded-lg text-indigo-400 transition-colors"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredData.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        No fragrances found matching your search.
                    </div>
                )}

                <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                    <span className="text-sm text-slate-400">
                        Showing {filteredData.length > 0 ? (page - 1) * itemsPerPage + 1 : 0} to {Math.min(page * itemsPerPage, filteredData.length)} of {filteredData.length} results
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 bg-slate-800 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-700 transition-colors"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 bg-slate-800 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-700 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DetailModal = ({ item, onClose }) => {
    if (!item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-700 p-6 flex justify-between items-start z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">{item.nombre_completo}</h2>
                        <p className="text-indigo-400 font-medium">{item.marca}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-xl">
                            <div className="text-slate-400 text-xs uppercase mb-1">Rating</div>
                            <div className="text-xl font-bold text-yellow-400 flex items-center">
                                {item.rating} <Star size={16} fill="currentColor" className="ml-1" />
                            </div>
                            <div className="text-xs text-slate-500 mt-1">{item.num_votos} votes</div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl">
                            <div className="text-slate-400 text-xs uppercase mb-1">Longevity</div>
                            <div className="text-xl font-bold text-white">{item.longevidad}</div>
                            <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-indigo-500 h-full" style={{ width: `${(item.longevidad_pct || 0) * 100}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl">
                            <div className="text-slate-400 text-xs uppercase mb-1">Sillage</div>
                            <div className="text-xl font-bold text-white">{item.estela}</div>
                            <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-pink-500 h-full" style={{ width: `${(item.estela_pct || 0) * 100}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-xl">
                            <div className="text-slate-400 text-xs uppercase mb-1">Price Value</div>
                            <div className="text-xl font-bold text-white">{item.precio}</div>
                            <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full" style={{ width: `${(item.precio_pct || 0) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Accords */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Wind size={20} className="mr-2 text-indigo-400" /> Main Accords
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {item.main_accords.split(',').map((accord, idx) => (
                                <span key={idx} className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-sm text-slate-300">
                                    {accord.trim()}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {item.notas_salida && (
                            <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                                <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider mb-3">Top Notes</h4>
                                <p className="text-slate-300 leading-relaxed">{item.notas_salida}</p>
                            </div>
                        )}
                        {item.notas_corazon && (
                            <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                                <h4 className="text-sm font-semibold text-pink-400 uppercase tracking-wider mb-3">Heart Notes</h4>
                                <p className="text-slate-300 leading-relaxed">{item.notas_corazon}</p>
                            </div>
                        )}
                        {item.notas_fondo && (
                            <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                                <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Base Notes</h4>
                                <p className="text-slate-300 leading-relaxed">{item.notas_fondo}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main App ---

const App = () => {
    const [data, setData] = useState(null);
    const [view, setView] = useState('dashboard'); // dashboard, explorer
    const [selectedItem, setSelectedItem] = useState(null);

    // Lucide icons re-render fix
    useEffect(() => {
        if (window.lucide) window.lucide.createIcons();
    });

    if (!data) {
        return <FileUploader onDataLoaded={setData} />;
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar */}
            <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Droplet size={20} className="text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Fragrance<span className="text-indigo-400">Explorer</span></span>
                    </div>

                    <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
                        <button
                            onClick={() => setView('dashboard')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'dashboard' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setView('explorer')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'explorer' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            Explorer
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
                {view === 'dashboard' ? (
                    <Dashboard data={data} />
                ) : (
                    <Explorer data={data} onViewDetails={setSelectedItem} />
                )}
            </main>

            {/* Detail Modal */}
            {selectedItem && (
                <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
