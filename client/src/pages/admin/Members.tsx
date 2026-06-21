import React from 'react';
import {NavigateFunction, useNavigate} from 'react-router-dom';
import { Search, Users, X } from "lucide-react";
import { ArtisanTool, Member, OtherTool, GamingSet, MusicalInstrument, ToolProficiency } from '../../types/member.ts'
import _ from 'lodash';
import {addMember, updateMember, useMembers} from "../../hooks/useMembers.ts";
import ToolTag from "../../components/forge/ToolTag.tsx";
import style from '../../components/forge/ToolTag.module.scss'
import MemberEditForm from "../public/MemberEditForm.tsx";
import MemberAddForm from "../public/MemberAddForm.tsx";

// ── Filter Types ──────────────────────────────────────────────

export interface MemberFilters {
    tools: ToolProficiency[];
    stats: {
        STR: [number, number];
        DEX: [number, number];
        INT: [number, number];
        WIS: [number, number];
        CHA: [number, number];
    };
}

export const DEFAULT_FILTERS: MemberFilters = {
    tools: [],
    stats: {
        STR: [1, 20],
        DEX: [1, 20],
        INT: [1, 20],
        WIS: [1, 20],
        CHA: [1, 20],
    },
};

// ── Constants ─────────────────────────────────────────────────

const ALL_TOOLS: ToolProficiency[] = [
    ...Object.values(ArtisanTool),
    ...Object.values(OtherTool)
];

const STATS = ['STR', 'DEX', 'INT', 'WIS', 'CHA'] as const;
type StatKey = typeof STATS[number];

// ── Props & State ─────────────────────────────────────────────

interface MembersProps {
    members: Member[];
    isLoading: boolean;
    error: Error | null;

    onEditClick: (value:number) => void;
    onAddClick: () => void;
}

interface MembersStates {
    filters: MemberFilters;
    toolSearch: string;
    dropdownOpen: boolean;
}

// ── Component ─────────────────────────────────────────────────

class MembersInner extends React.Component<MembersProps, MembersStates> {

    private dropdownRef = React.createRef<HTMLDivElement>();

    constructor(props: MembersProps) {
        super(props);

        this.state = {
            filters: DEFAULT_FILTERS,
            toolSearch: '',
            dropdownOpen: false,
        };
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
    }

    // ── Lifecycle ───────────────────────────────────────────────

    componentDidMount() {
        document.addEventListener('mousedown', this.handleOutsideClick);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleOutsideClick);
    }

    // ── Outside click ───────────────────────────────────────────

    handleOutsideClick(e: MouseEvent) {
        if (this.dropdownRef.current && !this.dropdownRef.current.contains(e.target as Node)) {
            this.setState({ dropdownOpen: false });
        }
    }

    // ── Tool filter helpers ─────────────────────────────────────

    toggleTool(tool: ToolProficiency) {
        const { filters } = this.state;
        const tools = filters.tools.includes(tool)
            ? filters.tools.filter(t => t !== tool)
            : [...filters.tools, tool];
        this.setState({ filters: { ...filters, tools } });
    }

    removeTool(tool: ToolProficiency) {
        const { filters } = this.state;
        this.setState({ filters: { ...filters, tools: filters.tools.filter(t => t !== tool) } });
    }

    // ── Stat filter helpers ─────────────────────────────────────

    updateStat(stat: StatKey, index: 0 | 1, value: number) {
        const { filters } = this.state;
        const range = [...filters.stats[stat]] as [number, number];
        range[index] = value;
        if (index === 0 && range[0] > range[1]) range[1] = range[0];
        if (index === 1 && range[1] < range[0]) range[0] = range[1];
        this.setState({ filters: { ...filters, stats: { ...filters.stats, [stat]: range } } });
    }

    clearAll() {
        this.setState({ filters: DEFAULT_FILTERS, toolSearch: '' });
    }

    // ── Derived data ────────────────────────────────────────────

    get filteredToolOptions(): ToolProficiency[] {
        const q = this.state.toolSearch.toLowerCase();
        return q ? ALL_TOOLS.filter(t => t.toLowerCase().includes(q)) : ALL_TOOLS;
    }

    get hasActiveFilters(): boolean {
        const { filters } = this.state;
        return (
            filters.tools.length > 0 ||
            STATS.some(s => filters.stats[s][0] !== 1 || filters.stats[s][1] !== 20)
        );
    }

    get filteredMembers(): Member[] {
        const { members } = this.props;
        const { filters } = this.state;

        return _.filter(members, (member: Member) => {
            // Tool filter — member must have ALL selected tools
            if (filters.tools.length > 0) {
                const memberTools = member.Tools.split(',').map((t: string) => t.trim());
                if (!filters.tools.every(t => memberTools.includes(t))) return false;
            }
            // Stat range filters
            if (member.STR < filters.stats.STR[0] || member.STR > filters.stats.STR[1]) return false;
            if (member.DEX < filters.stats.DEX[0] || member.DEX > filters.stats.DEX[1]) return false;
            if (member.INT < filters.stats.INT[0] || member.INT > filters.stats.INT[1]) return false;
            if (member.WIS < filters.stats.WIS[0] || member.WIS > filters.stats.WIS[1]) return false;
            if (member.CHA < filters.stats.CHA[0] || member.CHA > filters.stats.CHA[1]) return false;
            return true;
        });
    }

    // ── Tool tags renderer ──────────────────────────────────────

    toolTags(tools: string) {
        if (_.isEmpty(tools)) return null;
        return tools.split(',').map((tool: string) => (
            <ToolTag tool={tool.trim() as ToolProficiency} key={tool} />
        ));
    }

    // ── Render ──────────────────────────────────────────────────

    render() {
        const { isLoading, error } = this.props;
        const { filters, toolSearch, dropdownOpen } = this.state;

        if (isLoading) {
            return (
                <div className="min-h-screen bg-background flex flex-col items-center justify-center font-heading text-xl text-primary p-6">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <span className="text-5xl animate-spin">⚙️</span>
                        <span>Deciphering Roll of Names...</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="max-w-4xl mx-auto my-12 p-6 bg-card border-2 border-border text-center rounded-sm">
                    <h2 className="font-heading text-2xl text-primary mb-4">Roll retrieval failure</h2>
                    <p className="italic text-muted-foreground">"The scrolls containing the name lists were locked by a spell."</p>
                </div>
            );
        }

        const filtered = this.filteredMembers;

        return (
            <div className="max-w-6xl mx-auto px-4 py-10">

                {/* Header */}
                <div className="mb-6 border-b border-border/30 pb-6">
                    <h1 className="font-heading text-3xl font-bold tracking-widest text-[#1a0f00] flex items-center gap-3">
                        <Users className="w-8 h-8 text-primary" />
                        THE GUILD ROLL OF NAMES
                    </h1>
                    <p className="text-sm italic text-muted-foreground mt-1">
                        "A record of all guild members, their combat prowess, and craft mastery."
                    </p>
                    <button
                        className={"mef-btn mef-btn-save"}
                        onClick={() => this.props.onAddClick()}
                    >
                        Add
                    </button>
                </div>

                {/* ── Filter Bar ── */}
                <div className="bg-[#f5e9c8] border-2 border-[#c9a84c] rounded-sm p-4 mb-4 flex flex-wrap gap-6 items-start">

                    {/* Tool Picker */}
                    <div className="flex flex-col gap-1.5 min-w-[300px] flex-1">
                        <label className="text-[0.65rem] font-bold tracking-widest uppercase text-[#7a4e1a]">
                            Tool Proficiencies
                        </label>
                        <div className="relative" ref={this.dropdownRef}>
                            {/* Input box */}
                            <div
                                className="flex flex-wrap items-center gap-1 min-h-[36px] px-2 py-1 bg-[#fdf6e3] border border-[#c9a84c] rounded-sm cursor-text"
                                onClick={() => this.setState({ dropdownOpen: true })}
                            >
                                {filters.tools.map(tool => (
                                    <span
                                        key={tool}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#4a2e0a] text-[#f5c97a] border border-[#7a4e1a] rounded-sm text-[0.65rem] font-bold uppercase tracking-wider"
                                    >
                                        {tool}
                                        <button
                                            className="opacity-70 hover:opacity-100 flex items-center"
                                            onClick={e => { e.stopPropagation(); this.removeTool(tool); }}
                                        >
                                            <X size={10} />
                                        </button>
                                    </span>
                                ))}
                                <span className="flex items-center gap-1 flex-1 min-w-[80px]">
                                    <Search size={12} className="text-[#a07840]" />
                                    <input
                                        className="border-none bg-transparent outline-none text-[0.8rem] text-[#3b2a1a] w-full font-body placeholder:text-[#a07840]"
                                        value={toolSearch}
                                        placeholder={filters.tools.length === 0 ? 'Search tools...' : ''}
                                        onChange={e => this.setState({ toolSearch: e.target.value, dropdownOpen: true })}
                                        onFocus={() => this.setState({ dropdownOpen: true })}
                                    />
                                </span>
                            </div>

                            {/* Dropdown */}
                            {dropdownOpen && (
                                <div className="absolute top-[calc(100%+4px)] left-0 right-0 max-h-[220px] overflow-y-auto bg-[#fdf6e3] border border-[#c9a84c] rounded-sm z-50 shadow-[2px_4px_12px_rgba(58,35,12,0.2)]">
                                    {this.filteredToolOptions.length === 0 && (
                                        <div className="px-3 py-2 text-[0.78rem] text-[#a07840] italic">No tools found</div>
                                    )}
                                    {this.filteredToolOptions.map(tool => (
                                        <div
                                            key={tool}
                                            className={`flex items-center gap-2 px-3 py-1.5 text-[0.78rem] text-[#3b2a1a] cursor-pointer transition-colors hover:bg-[#e8d09a] ${filters.tools.includes(tool) ? 'bg-[#e8d09a]/50 font-semibold' : ''}`}
                                            onMouseDown={e => { e.preventDefault(); this.toggleTool(tool); }}
                                        >
                                            <span className="w-3.5 text-[0.7rem] font-black text-[#7a4e1a]">
                                                {filters.tools.includes(tool) ? '✓' : ''}
                                            </span>
                                            {tool}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stat Sliders */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[0.65rem] font-bold tracking-widest uppercase text-[#7a4e1a]">
                            Stat Ranges
                        </label>
                        <div className="flex flex-col gap-1.5">
                            {STATS.map(stat => (
                                <div key={stat} className="flex items-center gap-2">
                                    <span className="text-[0.65rem] font-bold tracking-wider text-[#7a4e1a] w-7">{stat}</span>
                                    <input
                                        type="range" min={1} max={20}
                                        value={filters.stats[stat][0]}
                                        onChange={e => this.updateStat(stat, 0, Number(e.target.value))}
                                        className="w-24 accent-[#4a2e0a] cursor-pointer"
                                    />
                                    <span className="text-[0.75rem] font-bold text-[#3b2a1a] w-5 text-center">{filters.stats[stat][0]}</span>
                                    <span className="text-[0.75rem] text-[#a07840]">–</span>
                                    <input
                                        type="range" min={1} max={20}
                                        value={filters.stats[stat][1]}
                                        onChange={e => this.updateStat(stat, 1, Number(e.target.value))}
                                        className="w-24 accent-[#4a2e0a] cursor-pointer"
                                    />
                                    <span className="text-[0.75rem] font-bold text-[#3b2a1a] w-5 text-center">{filters.stats[stat][1]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Clear + result count */}
                    <div className="flex flex-col items-end justify-between ml-auto gap-2 self-stretch">
                        <span className="text-[0.7rem] italic text-[#7a4e1a]">
                            {filtered.length} / {this.props.members.length} members
                        </span>
                        {this.hasActiveFilters && (
                            <button
                                className="flex items-center gap-1 px-3 py-1.5 border border-[#c9a84c] rounded-sm text-[#7a4e1a] text-[0.72rem] font-bold uppercase tracking-wider hover:bg-[#e8d09a] transition-colors"
                                onClick={() => this.clearAll()}
                            >
                                <X size={12} /> Clear filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Members List Ledger */}
                <div className="bg-card border-2 border-border shadow-[3px_4px_10px_rgba(58,35,12,0.2)] overflow-x-auto rounded-sm relative">
                    <div className="absolute inset-0.5 border border-dashed border-border/40 pointer-events-none rounded-sm" />

                    <table className="w-full text-left border-collapse relative z-10">
                        <thead>
                        <tr className="border-b border-border bg-[#e8d09a]/40 font-heading text-xs tracking-widest text-[#1a0f00]">
                            <th className="py-4 px-6 uppercase font-semibold">Member Name</th>
                            <th className="py-4 px-6 uppercase font-semibold">Tools</th>
                            <th className="py-4 px-6 uppercase font-semibold">STR</th>
                            <th className="py-4 px-6 uppercase font-semibold">DEX</th>
                            <th className="py-4 px-6 uppercase font-semibold">INT</th>
                            <th className="py-4 px-6 uppercase font-semibold">WIS</th>
                            <th className="py-4 px-6 uppercase font-semibold">CHA</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30 text-sm font-body text-[#3b2a1a]">

                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-10 text-center italic text-[#a07840] text-sm">
                                    "No members match the current seals of filtering."
                                </td>
                            </tr>
                        )}

                        {_.map(filtered, (member: Member, index: number) => (
                            <tr
                                className="hover:bg-[#e8d09a]/20 transition-colors cursor-pointer"
                                key={member.Name}
                                onClick={() => this.props.onEditClick(index)}
                            >
                                <td className="py-4 px-6 font-semibold text-[#1a0f00]">{member.Name}</td>
                                <td className="py-4 px-6">
                                    <div className={style.toolsCell}>{this.toolTags(member.Tools)}</div>
                                </td>
                                <td className="py-4 px-6 text-center font-bold">{member.STR}</td>
                                <td className="py-4 px-6 text-center font-bold">{member.DEX}</td>
                                <td className="py-4 px-6 text-center font-bold">{member.INT}</td>
                                <td className="py-4 px-6 text-center font-bold">{member.WIS}</td>
                                <td className="py-4 px-6 text-center font-bold">{member.CHA}</td>
                            </tr>
                        ))}

                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

// ── Wrapper ───────────────────────────────────────────────────

const Members: React.FC = () => {
    const { data: membersData, isLoading, error } = useMembers();
    const members = (membersData as Member[]) ?? [];

    const [isAdding, setisAdding] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [isSaving, setIsSaving]   = React.useState(false);
    const [selectedMember, setSelectedMember] = React.useState(-1);
    const updateMemberMutation = updateMember();
    const addMemberMutation = addMember();

    let member:Member|undefined = undefined;
    if (isEditing) {
        member  = members[Number(selectedMember)];
    }

    const handleAddSave = async (member: Member) => {
        setIsSaving(true);

        try{
            addMemberMutation.mutate(member, {
                onSuccess: () => {
                    alert('Member added successfully.');
                },
                onError: (err: Error) => {
                    console.log(err);
                }
            });
        } finally {
            setIsSaving(false);
            setIsEditing(false);
            setisAdding(false);
        }
    }

    const handleEditSave = async (updated: Member) => {
        setIsSaving(true);
        try {
            updateMemberMutation.mutate(updated, {
                onSuccess: () => {
                    alert('Member updated successfully.');
                },
                onError: (err: Error) => {
                    console.log(err);
                }
            });
        } finally {
            setIsSaving(false);
            setIsEditing(false);
            setisAdding(false);
        }
    };

    return (
        <>
            <MembersInner
                members={members}
                isLoading={isLoading}
                error={error}

                onEditClick={(value:number) => {
                    setIsEditing(true);
                    setSelectedMember(value);
                }}
                onAddClick={() => {
                    setisAdding(true);
                }}
            />

            {isAdding && (
                <MemberAddForm
                    onSave={handleAddSave}
                    onCancel={() => setisAdding(false)}
                    isSaving={isSaving}
                />
            )}

            {isEditing && (
                <MemberEditForm
                    member={member as Member}
                    onSave={handleEditSave}
                    onCancel={() => setIsEditing(false)}
                    isSaving={isSaving}
                />
            )}
        </>
    );
};

export default Members;