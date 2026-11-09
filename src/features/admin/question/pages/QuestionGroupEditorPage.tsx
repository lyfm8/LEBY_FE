import React, { useEffect, useState } from 'react';
import {
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    ChevronDown,
    ChevronUp,
    Eye,
    EyeOff,
    Loader2,
    Plus,
    Save,
    Trash2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePartAbilityOptions } from '../hooks/usePartAbilityOptions';
import { AbilityPicker } from '../components/editor/AbilityPicker';
import { ExplanationEditor } from '../components/editor/ExplanationEditor';
import { OptionsEditor } from '../components/editor/OptionsEditor';
import { MediaUploader } from '../components/media/MediaUploader';
import { ToeicQuestionPreview } from '../components/preview/ToeicQuestionPreview';
import { adminQuestionService } from '../services/adminQuestionService';
import type {
    CreateQuestionGroupPayload,
    QuestionGroupItem,
    QuestionMediaItem,
} from '../types';
import '../admin-question.css';

export const QuestionGroupEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();

    // Group Parent State
    const [name, setName] = useState<string>('');
    const [partId, setPartId] = useState<number | undefined>(undefined);
    const [instruction, setInstruction] = useState<string>('');
    const [passage, setPassage] = useState<string>('');
    const [transcript, setTranscript] = useState<string>('');
    const [translation, setTranslation] = useState<string>('');
    const [groupMedias, setGroupMedias] = useState<QuestionMediaItem[]>([]);
    const [descriptions, setDescriptions] = useState<string>('');

    // Sub-questions items (2 đến 5 câu)
    const [items, setItems] = useState<QuestionGroupItem[]>([
        {
            name: 'Câu hỏi 1',
            text: '',
            options: [
                { key: 'A', text: '' },
                { key: 'B', text: '' },
                { key: 'C', text: '' },
                { key: 'D', text: '' },
            ],
            correctKey: 'A',
            abilityIds: [],
            difficulty: 3,
            explanation: {},
        },
        {
            name: 'Câu hỏi 2',
            text: '',
            options: [
                { key: 'A', text: '' },
                { key: 'B', text: '' },
                { key: 'C', text: '' },
                { key: 'D', text: '' },
            ],
            correctKey: 'A',
            abilityIds: [],
            difficulty: 3,
            explanation: {},
        },
    ]);

    // UI state
    const [expandedItemIndex, setExpandedItemIndex] = useState<number>(0);
    const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState<boolean>(false);

    // Part & Ability options
    const { parts, abilities, selectedPart, isLoadingParts, isLoadingAbilities } =
        usePartAbilityOptions(partId);

    // Load data khi ở chế độ Edit
    useEffect(() => {
        if (!id) return;
        let isMounted = true;
        setIsLoadingInitial(true);
        adminQuestionService
            .getById(Number(id))
            .then((res) => {
                if (isMounted && res.success && res.data) {
                    const q = res.data;
                    setName(q.name || '');
                    setPartId(q.partId);
                    setInstruction(q.instruction || '');
                    setPassage(q.passage || '');
                    setDescriptions(q.descriptions || '');
                    if (q.explanation) {
                        setTranscript(q.explanation.transcript || '');
                        setTranslation(q.explanation.translation || '');
                    }
                    if (q.medias) {
                        setGroupMedias(q.medias);
                    }
                    if (q.items && q.items.length > 0) {
                        setItems(
                            q.items.map((it) => ({
                                id: it.id,
                                name: it.name || '',
                                text: it.text || '',
                                options: it.options || [
                                    { key: 'A', text: '' },
                                    { key: 'B', text: '' },
                                    { key: 'C', text: '' },
                                    { key: 'D', text: '' },
                                ],
                                correctKey: it.correctKey || 'A',
                                abilityIds: it.abilities?.map((a) => a.abilityId) || [],
                                difficulty: it.difficulty || 3,
                                explanation: it.explanation || {},
                            }))
                        );
                    }
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setFormError(err.message || 'Không thể tải thông tin chùm câu hỏi');
                }
            })
            .finally(() => {
                if (isMounted) setIsLoadingInitial(false);
            });

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleAddItem = () => {
        if (items.length >= 5) return;
        const newIndex = items.length + 1;
        setItems([
            ...items,
            {
                name: `Câu hỏi ${newIndex}`,
                text: '',
                options: [
                    { key: 'A', text: '' },
                    { key: 'B', text: '' },
                    { key: 'C', text: '' },
                    { key: 'D', text: '' },
                ],
                correctKey: 'A',
                abilityIds: items[0]?.abilityIds || [],
                difficulty: 3,
                explanation: {},
            },
        ]);
        setExpandedItemIndex(items.length);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length <= 2) {
            setFormError('Chùm câu hỏi phải có tối thiểu 2 câu hỏi con');
            return;
        }
        setItems(items.filter((_, idx) => idx !== index));
        if (expandedItemIndex >= items.length - 1) {
            setExpandedItemIndex(Math.max(0, items.length - 2));
        }
    };

    const handleMoveItem = (index: number, direction: 'UP' | 'DOWN') => {
        const targetIndex = direction === 'UP' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= items.length) return;

        const next = [...items];
        const temp = next[index];
        next[index] = next[targetIndex];
        next[targetIndex] = temp;
        setItems(next);
        setExpandedItemIndex(targetIndex);
    };

    const handleUpdateItem = (index: number, field: keyof QuestionGroupItem, value: any) => {
        const next = [...items];
        next[index] = { ...next[index], [field]: value };
        setItems(next);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!name.trim()) {
            setFormError('Vui lòng nhập tên cho chùm câu hỏi');
            return;
        }
        if (!partId) {
            setFormError('Vui lòng chọn Phần thi (Part)');
            return;
        }
        if (items.length < 2 || items.length > 5) {
            setFormError('Chùm câu hỏi phải có từ 2 đến 5 câu hỏi con');
            return;
        }

        // Validate từng câu con
        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            if (!it.name.trim()) {
                setFormError(`Câu hỏi con thứ ${i + 1} chưa có tên gợi nhớ`);
                setExpandedItemIndex(i);
                return;
            }
            if (it.abilityIds.length === 0) {
                setFormError(`Câu hỏi con thứ ${i + 1} chưa được gán kỹ năng (Ability)`);
                setExpandedItemIndex(i);
                return;
            }
            if (!it.options.some((opt) => opt.key.toUpperCase() === it.correctKey.toUpperCase())) {
                setFormError(`Câu hỏi con thứ ${i + 1} chưa chọn đáp án đúng hợp lệ`);
                setExpandedItemIndex(i);
                return;
            }
        }

        const payload: CreateQuestionGroupPayload = {
            name: name.trim(),
            partId,
            instruction: instruction.trim(),
            passage: passage.trim(),
            transcript: transcript.trim(),
            translation: translation.trim(),
            descriptions: descriptions.trim(),
            medias: groupMedias.map((m, idx) => ({ mediaId: m.mediaId, orderNo: idx + 1 })),
            items: items.map((it, idx) => ({
                id: it.id,
                name: it.name.trim(),
                orderNo: idx + 1,
                text: it.text?.trim() || '',
                options: it.options,
                correctKey: it.correctKey.toUpperCase(),
                abilityIds: it.abilityIds,
                difficulty: it.difficulty,
                explanation: it.explanation,
            })),
        };

        setIsSaving(true);
        try {
            if (isEditMode) {
                await adminQuestionService.updateGroup(Number(id), payload);
            } else {
                await adminQuestionService.createGroup(payload);
            }
            navigate('/admin/questions');
        } catch (err: any) {
            setFormError(
                err.response?.data?.message ||
                err.message ||
                'Lưu chùm câu hỏi thất bại, vui lòng kiểm tra lại'
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoadingInitial) {
        return (
            <div className="question-empty-card">
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#ea580c' }} />
                <h3 className="empty-title">Đang tải dữ liệu chùm câu hỏi...</h3>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="admin-editor-page">
            {/* Top Navigation */}
            <div className="editor-top-nav">
                <div className="editor-title-group">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/questions')}
                        className="btn-back-circle"
                        title="Quay lại danh sách"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="editor-heading">
                            {isEditMode ? `Chỉnh sửa chùm câu hỏi (G-${id})` : 'Tạo chùm câu hỏi mới'}
                        </h1>
                        <p className="editor-subheading">
                            Một ngữ cảnh / bài đọc chung cho nhiều câu hỏi con (Part 3, 4, 6, 7).
                        </p>
                    </div>
                </div>

                <div>
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                        <span>{showPreview ? 'Ẩn xem trước' : 'Xem trước bài thi'}</span>
                    </button>
                </div>
            </div>

            {formError && (
                <div className="admin-alert-banner error">
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{formError}</span>
                </div>
            )}

            {/* Khung xem trước TOEIC Simulation */}
            {showPreview && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <ToeicQuestionPreview
                        question={{
                            name,
                            partName: selectedPart?.name,
                            section: selectedPart?.sections,
                            instruction,
                            passage,
                            medias: groupMedias,
                            isGroup: true,
                            items,
                        }}
                    />
                </div>
            )}

            {/* Layout 2 cột */}
            <div className="editor-layout-grid">
                {/* CỘT TRÁI: Ngữ cảnh chung & Danh sách câu hỏi con */}
                <div className="editor-col-main">
                    {/* Phần 1: Ngữ cảnh chung của chùm */}
                    <div className="editor-card">
                        <div className="editor-card-header">
                            <h3 className="editor-card-title">Ngữ cảnh chung của chùm câu hỏi</h3>
                            <span style={{ fontSize: '0.75rem', color: '#ea580c', backgroundColor: '#fff7ed', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontWeight: 600 }}>
                                Dùng chung cho các câu con
                            </span>
                        </div>
                        <div className="editor-card-body">
                            {/* Hướng dẫn chung */}
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label" style={{ fontWeight: 600 }}>
                                    Lời hướng dẫn chung (Instruction)
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Ví dụ: Questions 32-34 refer to the following conversation."
                                    value={instruction}
                                    onChange={(e) => setInstruction(e.target.value)}
                                />
                            </div>

                            {/* Đoạn văn đọc hiểu (Part 6, 7) */}
                            {selectedPart?.sections === 'READING' && (
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label" style={{ fontWeight: 600 }}>
                                        Đoạn văn đọc hiểu chung (Passage / Memo / Email)
                                    </label>
                                    <textarea
                                        className="form-textarea"
                                        style={{ minHeight: '140px', fontFamily: 'Georgia, serif' }}
                                        placeholder="Dán toàn bộ văn bản đọc hiểu vào đây..."
                                        value={passage}
                                        onChange={(e) => setPassage(e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Lời thoại bài nghe (Part 3, 4) */}
                            {selectedPart?.sections === 'LISTENING' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.875rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label" style={{ fontWeight: 600 }}>
                                            Transcript bài nghe (Lời thoại)
                                        </label>
                                        <textarea
                                            className="form-textarea"
                                            style={{ minHeight: '90px' }}
                                            placeholder="Dùng cho phần giải thích sau thi..."
                                            value={transcript}
                                            onChange={(e) => setTranscript(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label" style={{ fontWeight: 600 }}>
                                            Bản dịch tiếng Việt
                                        </label>
                                        <textarea
                                            className="form-textarea"
                                            style={{ minHeight: '90px' }}
                                            placeholder="Dịch nghĩa đoạn nghe..."
                                            value={translation}
                                            onChange={(e) => setTranslation(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Media chung của chùm */}
                            <MediaUploader
                                medias={groupMedias}
                                onChange={setGroupMedias}
                                maxFiles={3}
                                allowedKinds={
                                    selectedPart?.sections === 'READING'
                                        ? ['IMAGE', 'VIDEO']
                                        : ['AUDIO', 'IMAGE', 'VIDEO']
                                }
                                label="Media chung của chùm (Audio bài nghe hoặc Ảnh đoạn văn)"
                                hint={
                                    selectedPart?.sections === 'LISTENING'
                                        ? 'Part 3, 4 bắt buộc có 1 tệp âm thanh (Audio MP3/WAV) chung cho cả 3 câu hỏi.'
                                        : 'Part 6, 7 có thể đính kèm ảnh bài đọc thay thế hoặc bổ trợ cho đoạn văn text.'
                                }
                            />
                        </div>
                    </div>

                    {/* Phần 2: Danh sách các câu hỏi con */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 600, color: '#111827' }}>
                                    Danh sách câu hỏi con ({items.length}/5 câu)
                                </h3>
                                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                                    Mỗi câu hỏi con có nội dung, 4 phương án, đáp án đúng và kỹ năng riêng.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="btn-secondary"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: '#ea580c', borderColor: '#fdba74' }}
                                onClick={handleAddItem}
                                disabled={items.length >= 5}
                            >
                                <Plus size={14} /> Thêm câu con
                            </button>
                        </div>

                        {/* Accordion từng câu hỏi con */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {items.map((item, idx) => {
                                const isExpanded = expandedItemIndex === idx;
                                return (
                                    <div
                                        key={idx}
                                        className="editor-card"
                                        style={{ margin: 0 }}
                                    >
                                        {/* Header thanh accordion */}
                                        <div
                                            style={{
                                                padding: '0.875rem 1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                cursor: 'pointer',
                                                backgroundColor: '#f9fafb',
                                                borderBottom: isExpanded ? '1px solid #f3f4f6' : 'none',
                                            }}
                                            onClick={() => setExpandedItemIndex(isExpanded ? -1 : idx)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span className="sub-q-badge">{idx + 1}</span>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.8125rem' }}>
                                                        {item.name || `Câu hỏi con #${idx + 1}`}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                        {item.text || 'Chưa nhập đề bài'} · Đáp án đúng:{' '}
                                                        <span style={{ fontWeight: 700, color: '#15803d' }}>
                                                            ({item.correctKey})
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#9ca3af' }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    type="button"
                                                    className="btn-icon"
                                                    disabled={idx === 0}
                                                    onClick={() => handleMoveItem(idx, 'UP')}
                                                    title="Chuyển lên trên"
                                                >
                                                    <ArrowUp size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-icon"
                                                    disabled={idx === items.length - 1}
                                                    onClick={() => handleMoveItem(idx, 'DOWN')}
                                                    title="Chuyển xuống dưới"
                                                >
                                                    <ArrowDown size={14} />
                                                </button>
                                                {items.length > 2 && (
                                                    <button
                                                        type="button"
                                                        className="btn-icon danger"
                                                        onClick={() => handleRemoveItem(idx)}
                                                        title="Xóa câu hỏi con này"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                                <div style={{ marginLeft: '0.5rem', display: 'flex', alignItems: 'center' }}>
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Body chỉnh sửa chi tiết câu con khi mở rộng */}
                                        {isExpanded && (
                                            <div className="editor-card-body">
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                                                    <div className="form-group" style={{ margin: 0 }}>
                                                        <label className="form-label" style={{ fontWeight: 600 }}>
                                                            Tên câu con <span style={{ color: '#dc2626' }}>*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-input"
                                                            placeholder="Ví dụ: Q1 What are speakers discussing?"
                                                            value={item.name}
                                                            onChange={(e) =>
                                                                handleUpdateItem(idx, 'name', e.target.value)
                                                            }
                                                        />
                                                    </div>

                                                    <div className="form-group" style={{ margin: 0 }}>
                                                        <label className="form-label" style={{ fontWeight: 600 }}>
                                                            Độ khó câu con: {item.difficulty}/5
                                                        </label>
                                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                            {[1, 2, 3, 4, 5].map((lvl) => (
                                                                <button
                                                                    key={lvl}
                                                                    type="button"
                                                                    style={{
                                                                        flex: 1,
                                                                        padding: '0.35rem 0',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 700,
                                                                        borderRadius: '0.25rem',
                                                                        border: item.difficulty === lvl ? '1px solid #ea580c' : '1px solid #d1d5db',
                                                                        backgroundColor: item.difficulty === lvl ? '#ea580c' : '#ffffff',
                                                                        color: item.difficulty === lvl ? '#ffffff' : '#374151',
                                                                        cursor: 'pointer',
                                                                    }}
                                                                    onClick={() =>
                                                                        handleUpdateItem(idx, 'difficulty', lvl)
                                                                    }
                                                                >
                                                                    {lvl}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="form-group" style={{ margin: 0 }}>
                                                    <label className="form-label" style={{ fontWeight: 600 }}>
                                                        Nội dung đề bài câu con
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        placeholder="Nhập đề bài câu con..."
                                                        value={item.text || ''}
                                                        onChange={(e) =>
                                                            handleUpdateItem(idx, 'text', e.target.value)
                                                        }
                                                    />
                                                </div>

                                                {/* Các phương án của câu con */}
                                                <OptionsEditor
                                                    options={item.options}
                                                    correctKey={item.correctKey}
                                                    onOptionsChange={(opts) =>
                                                        handleUpdateItem(idx, 'options', opts)
                                                    }
                                                    onCorrectKeyChange={(key) =>
                                                        handleUpdateItem(idx, 'correctKey', key)
                                                    }
                                                    allow3Options={false}
                                                />

                                                {/* Kỹ năng riêng của câu con */}
                                                <AbilityPicker
                                                    abilities={abilities}
                                                    selectedIds={item.abilityIds}
                                                    onChange={(ids) =>
                                                        handleUpdateItem(idx, 'abilityIds', ids)
                                                    }
                                                    isLoading={isLoadingAbilities}
                                                />

                                                {/* Lời giải thích câu con */}
                                                <ExplanationEditor
                                                    explanation={item.explanation || {}}
                                                    onChange={(exp) =>
                                                        handleUpdateItem(idx, 'explanation', exp)
                                                    }
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: Thuộc tính chùm câu hỏi */}
                <div className="editor-col-sidebar">
                    <div className="editor-card">
                        <div className="editor-card-header">
                            <h3 className="editor-card-title">Thông tin chùm câu hỏi</h3>
                        </div>
                        <div className="editor-card-body">
                            {/* Tên chùm */}
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label" style={{ fontWeight: 600 }}>
                                    Tên chùm câu hỏi <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Ví dụ: Office relocation announcement"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Phần thi (Part) */}
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label" style={{ fontWeight: 600 }}>
                                    Phần thi (Part) <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <select
                                    className="form-select"
                                    value={partId || ''}
                                    onChange={(e) => {
                                        const val = e.target.value ? Number(e.target.value) : undefined;
                                        setPartId(val);
                                    }}
                                    disabled={isLoadingParts}
                                    required
                                >
                                    <option value="">-- Chọn Phần thi chùm (Part 3, 4, 6, 7) --</option>
                                    {parts.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.sections})
                                        </option>
                                    ))}
                                </select>
                                {selectedPart && (
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ea580c', marginTop: '0.25rem' }}>
                                        Section: {selectedPart.sections} (áp dụng cho toàn bộ câu con)
                                    </span>
                                )}
                            </div>

                            {/* Ghi chú nội bộ */}
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label" style={{ fontWeight: 600 }}>
                                    Ghi chú nội bộ
                                </label>
                                <textarea
                                    className="form-textarea"
                                    style={{ minHeight: '80px' }}
                                    placeholder="Ghi chú dành riêng cho giáo viên..."
                                    value={descriptions}
                                    onChange={(e) => setDescriptions(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thanh hành động dưới chân */}
            <div className="editor-footer-bar">
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate('/admin/questions')}
                    disabled={isSaving}
                >
                    Hủy bỏ
                </button>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            <span>Đang lưu chùm...</span>
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            <span>{isEditMode ? 'Cập nhật chùm câu hỏi' : 'Lưu chùm câu hỏi'}</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};
