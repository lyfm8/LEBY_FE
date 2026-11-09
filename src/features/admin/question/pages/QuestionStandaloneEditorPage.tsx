import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Loader2, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePartAbilityOptions } from '../hooks/usePartAbilityOptions';
import { AbilityPicker } from '../components/editor/AbilityPicker';
import { ExplanationEditor } from '../components/editor/ExplanationEditor';
import { OptionsEditor } from '../components/editor/OptionsEditor';
import { MediaUploader } from '../components/media/MediaUploader';
import { ToeicQuestionPreview } from '../components/preview/ToeicQuestionPreview';
import { adminQuestionService } from '../services/adminQuestionService';
import type {
    CreateStandaloneQuestionPayload,
    QuestionExplanation,
    QuestionMediaItem,
    QuestionOption,
} from '../types';
import '../admin-question.css';

export const QuestionStandaloneEditorPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const navigate = useNavigate();

    // Form state
    const [name, setName] = useState<string>('');
    const [partId, setPartId] = useState<number | undefined>(undefined);
    const [abilityIds, setAbilityIds] = useState<number[]>([]);
    const [difficulty, setDifficulty] = useState<number>(3);
    const [text, setText] = useState<string>('');
    const [options, setOptions] = useState<QuestionOption[]>([
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
    ]);
    const [correctKey, setCorrectKey] = useState<string>('A');
    const [explanation, setExplanation] = useState<QuestionExplanation>({
        transcript: '',
        translation: '',
        clue: '',
        analysis: '',
        vocabulary: [],
    });
    const [medias, setMedias] = useState<QuestionMediaItem[]>([]);
    const [descriptions, setDescriptions] = useState<string>('');

    // UI state
    const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState<boolean>(false);

    // Part & Ability options
    const { parts, abilities, selectedPart, isLoadingParts, isLoadingAbilities } =
        usePartAbilityOptions(partId);

    // Tự động điều chỉnh số lượng đáp án khi đổi Part (ví dụ Part 2 chỉ có 3 đáp án A, B, C)
    useEffect(() => {
        if (selectedPart?.name?.toLowerCase().includes('part 2')) {
            if (options.length > 3) {
                setOptions(options.slice(0, 3));
                if (correctKey === 'D') setCorrectKey('A');
            }
        }
    }, [selectedPart, options, correctKey]);

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
                    setDifficulty(q.difficulty || 3);
                    setText(q.text || '');
                    if (q.options && q.options.length > 0) {
                        setOptions(q.options);
                    }
                    if (q.correctKey) {
                        setCorrectKey(q.correctKey);
                    }
                    if (q.explanation) {
                        setExplanation(q.explanation);
                    }
                    if (q.medias) {
                        setMedias(q.medias);
                    }
                    if (q.descriptions) {
                        setDescriptions(q.descriptions);
                    }
                    if (q.abilities) {
                        setAbilityIds(q.abilities.map((a) => a.abilityId));
                    }
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setFormError(err.message || 'Không thể tải dữ liệu câu hỏi để chỉnh sửa');
                }
            })
            .finally(() => {
                if (isMounted) setIsLoadingInitial(false);
            });
        return () => {
            isMounted = false;
        };
    }, [id]);

    const validateForm = (): boolean => {
        if (!name.trim()) {
            setFormError('Vui lòng nhập tên gợi nhớ câu hỏi');
            return false;
        }
        if (!partId) {
            setFormError('Vui lòng chọn Phần thi (Part)');
            return false;
        }
        if (!abilityIds || abilityIds.length === 0) {
            setFormError('Vui lòng chọn ít nhất 1 kỹ năng năng lực (Ability)');
            return false;
        }
        const emptyOption = options.find((o) => !o.text.trim());
        if (emptyOption) {
            setFormError(`Phương án (${emptyOption.key}) chưa được nhập nội dung`);
            return false;
        }
        if (!options.some((o) => o.key.toUpperCase() === correctKey.toUpperCase())) {
            setFormError('Đáp án đúng được chọn không khớp với bất kỳ phương án nào');
            return false;
        }
        setFormError(null);
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const payload: CreateStandaloneQuestionPayload = {
            name: name.trim(),
            partId: partId!,
            abilityIds,
            difficulty,
            text: text.trim(),
            options,
            correctKey: correctKey.toUpperCase(),
            explanation,
            medias,
            descriptions: descriptions.trim(),
        };

        setIsSaving(true);
        try {
            if (isEditMode) {
                await adminQuestionService.updateStandalone(Number(id), payload);
            } else {
                await adminQuestionService.createStandalone(payload);
            }
            navigate('/admin/questions');
        } catch (err: any) {
            setFormError(
                err.response?.data?.message ||
                err.message ||
                'Lưu câu hỏi thất bại, vui lòng kiểm tra lại dữ liệu'
            );
        } finally {
            setIsSaving(false);
        }
    };

    // Pre-flight check states
    const hasValidName = name.trim().length > 0;
    const hasValidOptions = options.length >= 3 && options.every((o) => o.text.trim().length > 0);
    const isReadyToSubmit = hasValidName && !!partId && abilityIds.length > 0 && hasValidOptions;

    if (isLoadingInitial) {
        return (
            <div className="question-empty-card">
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#ea580c' }} />
                <h3 className="empty-title">Đang tải dữ liệu câu hỏi...</h3>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="admin-editor-page">
            {/* Top Navigation Bar */}
            <div className="editor-top-nav">
                <div className="editor-title-group">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/questions')}
                        className="btn-back-circle"
                        title="Quay lại ngân hàng câu hỏi"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="editor-heading">
                            {isEditMode ? `Chỉnh sửa câu hỏi đơn (Q-${id})` : 'Tạo câu hỏi đơn mới'}
                        </h1>
                        <p className="editor-subheading">
                            Biên soạn câu hỏi độc lập (Part 1, 2, 5) kèm nội dung, đáp án và media riêng.
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

            {/* Thông báo lỗi validation */}
            {formError && (
                <div className="admin-alert-banner error">
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{formError}</span>
                </div>
            )}

            {/* Khung xem trước TOEIC Simulation nếu được bật */}
            {showPreview && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <ToeicQuestionPreview
                        question={{
                            name,
                            partName: selectedPart?.name,
                            section: selectedPart?.sections,
                            text,
                            options,
                            correctKey,
                            medias,
                            isGroup: false,
                        }}
                    />
                </div>
            )}

            {/* Layout 2 cột: Nội dung chính & Thuộc tính Sidebar */}
            <div className="editor-layout-grid">
                {/* CỘT TRÁI: Nội dung câu hỏi, Đáp án, Media, Lời giải */}
                <div className="editor-col-main">
                    {/* 1. Nội dung đề bài */}
                    <div className="editor-card">
                        <div className="editor-card-header">
                            <h3 className="editor-card-title">Nội dung câu hỏi / Đề bài</h3>
                        </div>
                        <div className="editor-card-body">
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
                                Với câu hỏi Part 1 hoặc Part 2 chỉ nghe audio, bạn có thể để trống hoặc ghi hướng dẫn ngắn.
                            </p>
                            <textarea
                                className="form-textarea"
                                style={{ minHeight: '90px' }}
                                placeholder="Ví dụ: When will the delivery arrive? hoặc The manager _____ the new budget."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 2. Phương án trả lời và đáp án đúng */}
                    <div className="editor-card">
                        <div className="editor-card-header">
                            <h3 className="editor-card-title">Đáp án</h3>
                        </div>
                        <div className="editor-card-body">
                            <OptionsEditor
                                options={options}
                                correctKey={correctKey}
                                onOptionsChange={setOptions}
                                onCorrectKeyChange={setCorrectKey}
                                allow3Options={true}
                            />
                        </div>
                    </div>

                    {/* 3. Tệp đa phương tiện Media riêng */}
                    <div className="editor-card">
                        <div className="editor-card-header">
                            <h3 className="editor-card-title">Media riêng</h3>
                        </div>
                        <div className="editor-card-body">
                            <MediaUploader
                                medias={medias}
                                onChange={setMedias}
                                maxFiles={3}
                                allowedKinds={
                                    selectedPart?.sections === 'READING'
                                        ? ['IMAGE', 'VIDEO']
                                        : ['AUDIO', 'IMAGE', 'VIDEO']
                                }
                                label="Tệp âm thanh / hình ảnh"
                                hint={
                                    selectedPart?.sections === 'LISTENING'
                                        ? 'Part 1, 2 bắt buộc có tệp âm thanh (Audio MP3/WAV). Part 1 có thể kèm ảnh minh họa.'
                                        : 'Phần Reading chỉ đính kèm hình ảnh minh họa (nếu có).'
                                }
                            />
                        </div>
                    </div>

                    {/* 4. Giải thích chi tiết đáp án */}
                    <div className="editor-card">
                        <div className="editor-card-body" style={{ padding: '0.75rem' }}>
                            <ExplanationEditor explanation={explanation} onChange={setExplanation} />
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: Thuộc tính câu hỏi & Metadata */}
                <div className="editor-col-sidebar">
                    <div className="editor-card">
                        <div className="editor-card-header">
                            <h3 className="editor-card-title">Thông tin câu hỏi</h3>
                        </div>
                        <div className="editor-card-body">
                            {/* Tên câu hỏi */}
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label" style={{ fontWeight: 600 }}>
                                    Mã gợi nhớ câu hỏi <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Ví dụ: Q-0248 Delivery time"
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
                                        setAbilityIds([]);
                                    }}
                                    disabled={isLoadingParts}
                                    required
                                >
                                    <option value="">-- Chọn Phần thi --</option>
                                    {parts.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} ({p.sections})
                                        </option>
                                    ))}
                                </select>
                                {selectedPart && (
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ea580c', marginTop: '0.25rem' }}>
                                        Kỹ năng: {selectedPart.sections}
                                    </span>
                                )}
                            </div>

                            {/* Kỹ năng (Ability) */}
                            <AbilityPicker
                                abilities={abilities}
                                selectedIds={abilityIds}
                                onChange={setAbilityIds}
                                isLoading={isLoadingAbilities}
                            />

                            {/* Mức độ khó */}
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label" style={{ fontWeight: 600 }}>
                                    Độ khó: <span style={{ color: '#ea580c', fontWeight: 700 }}>{difficulty}/5</span>
                                </label>
                                <div style={{ display: 'flex', gap: '0.375rem' }}>
                                    {[1, 2, 3, 4, 5].map((lvl) => (
                                        <button
                                            key={lvl}
                                            type="button"
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem 0',
                                                fontSize: '0.8125rem',
                                                fontWeight: 700,
                                                borderRadius: '0.375rem',
                                                border: difficulty === lvl ? '1px solid #ea580c' : '1px solid #d1d5db',
                                                backgroundColor: difficulty === lvl ? '#ea580c' : '#ffffff',
                                                color: difficulty === lvl ? '#ffffff' : '#374151',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s',
                                            }}
                                            onClick={() => setDifficulty(lvl)}
                                        >
                                            {lvl}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Ghi chú nội bộ */}
                            <div className="form-group" style={{ margin: 0 }}>
                                <label className="form-label" style={{ fontWeight: 600 }}>
                                    Ghi chú nội bộ
                                </label>
                                <textarea
                                    className="form-textarea"
                                    style={{ minHeight: '60px' }}
                                    placeholder="Ghi chú dành riêng cho giáo viên..."
                                    value={descriptions}
                                    onChange={(e) => setDescriptions(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pre-flight Checklist Card */}
                    <div className="editor-card">
                        <div className="editor-card-header">
                            <h3 className="editor-card-title">Kiểm tra trước khi lưu</h3>
                        </div>
                        <div className="editor-card-body">
                            <div className="preflight-list">
                                <div className={`preflight-check-item ${hasValidName ? 'passed' : ''}`}>
                                    <CheckCircle2 size={16} color={hasValidName ? '#15803d' : '#9ca3af'} />
                                    <span>Đã có mã / tên gợi nhớ câu hỏi</span>
                                </div>
                                <div className={`preflight-check-item ${partId ? 'passed' : ''}`}>
                                    <CheckCircle2 size={16} color={partId ? '#15803d' : '#9ca3af'} />
                                    <span>Đã chọn Phần thi (Part)</span>
                                </div>
                                <div className={`preflight-check-item ${abilityIds.length > 0 ? 'passed' : ''}`}>
                                    <CheckCircle2 size={16} color={abilityIds.length > 0 ? '#15803d' : '#9ca3af'} />
                                    <span>Đã chọn ít nhất 1 kỹ năng đánh giá</span>
                                </div>
                                <div className={`preflight-check-item ${hasValidOptions ? 'passed' : ''}`}>
                                    <CheckCircle2 size={16} color={hasValidOptions ? '#15803d' : '#9ca3af'} />
                                    <span>Đủ các phương án trả lời & 1 đáp án đúng</span>
                                </div>
                            </div>

                            <div className={`preflight-banner ${isReadyToSubmit ? 'ready' : 'pending'}`}>
                                {isReadyToSubmit ? '✓ Sẵn sàng lưu vào ngân hàng' : '⚠ Còn một số trường chưa hoàn tất'}
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
                            <span>Đang lưu...</span>
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            <span>{isEditMode ? 'Cập nhật câu hỏi' : 'Lưu câu hỏi đơn'}</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};
