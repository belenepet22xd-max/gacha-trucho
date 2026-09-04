import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Character,
  BackdropId,
  BackdropInfo,
  StudioCharacterInstance,
  SpeechBubble,
  BubbleType,
  BubbleTail,
  PoseType
} from '../types';
import { CanvasRenderer } from '../utils/canvasRenderer';
import { sound } from '../utils/audio';
import { BACKDROPS } from '../data/presets';
import {
  MessageSquare,
  Plus,
  Trash2,
  Image as ImageIcon,
  Download,
  FlipHorizontal,
  Move,
  Layers,
  Sparkles,
  Type,
  UserPlus,
  Smile,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface StudioModeProps {
  savedCharacters: Character[];
  unlockedBackdrops: string[];
  onQuickExport: (canvasElement?: HTMLCanvasElement) => void;
}

export const StudioMode: React.FC<StudioModeProps> = ({
  savedCharacters,
  unlockedBackdrops,
  onQuickExport,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Studio State
  const [selectedBackdrop, setSelectedBackdrop] = useState<BackdropId>('school_classroom');
  const [placedCharacters, setPlacedCharacters] = useState<StudioCharacterInstance[]>([]);
  const [speechBubbles, setSpeechBubbles] = useState<SpeechBubble[]>([]);

  // Selection
  const [selectedCharInstanceId, setSelectedCharInstanceId] = useState<string | null>(null);
  const [selectedBubbleId, setSelectedBubbleId] = useState<string | null>(null);

  // Active studio tool tab
  const [activeStudioTab, setActiveStudioTab] = useState<'actors' | 'backdrops' | 'bubbles'>('actors');

  // Dragging state
  const isDraggingRef = useRef<{
    type: 'character' | 'bubble' | null;
    id: string | null;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({
    type: null,
    id: null,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  // Initialize initial characters if empty
  useEffect(() => {
    if (placedCharacters.length === 0 && savedCharacters.length > 0) {
      const defaultInstances: StudioCharacterInstance[] = [];
      const char1 = savedCharacters[0];
      defaultInstances.push({
        instanceId: 'inst_1',
        characterId: char1.id,
        character: char1,
        x: 280,
        y: 280,
        scale: 0.95,
        rotation: 0,
        flipX: false,
        pose: 'peace',
        zIndex: 1,
      });

      if (savedCharacters.length > 1) {
        const char2 = savedCharacters[1];
        defaultInstances.push({
          instanceId: 'inst_2',
          characterId: char2.id,
          character: char2,
          x: 520,
          y: 280,
          scale: 0.95,
          rotation: 0,
          flipX: true,
          pose: 'wave',
          zIndex: 2,
        });
      }

      setPlacedCharacters(defaultInstances);
      setSelectedCharInstanceId(defaultInstances[0].instanceId);

      // Add starter speech bubble
      setSpeechBubbles([
        {
          id: 'bubble_welcome',
          text: 'Konnichiwa! Welcome to Gacha Studio!',
          speakerName: char1.name,
          x: 180,
          y: 60,
          width: 220,
          height: 70,
          type: 'speech',
          tail: 'bottom_left',
          bgColor: '#ffffff',
          textColor: '#18181b',
          fontSize: 13,
        },
      ]);
    }
  }, [savedCharacters]);

  // Render canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const displayWidth = 800;
    const displayHeight = 500;

    if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    CanvasRenderer.renderScene(ctx, {
      width: displayWidth,
      height: displayHeight,
      backdropId: selectedBackdrop,
      characters: placedCharacters,
      bubbles: speechBubbles,
      selectedBubbleId,
      selectedCharInstanceId,
    });
    ctx.restore();
  }, [selectedBackdrop, placedCharacters, speechBubbles, selectedBubbleId, selectedCharInstanceId]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Pointer / Mouse interaction for dragging characters & bubbles
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 500 / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // 1. Check if clicked on a speech bubble
    for (let i = speechBubbles.length - 1; i >= 0; i--) {
      const b = speechBubbles[i];
      if (
        mouseX >= b.x &&
        mouseX <= b.x + b.width &&
        mouseY >= b.y &&
        mouseY <= b.y + b.height
      ) {
        sound.playClick();
        setSelectedBubbleId(b.id);
        setSelectedCharInstanceId(null);
        isDraggingRef.current = {
          type: 'bubble',
          id: b.id,
          startX: mouseX,
          startY: mouseY,
          initialX: b.x,
          initialY: b.y,
        };
        return;
      }
    }

    // 2. Check if clicked on a character
    for (let i = placedCharacters.length - 1; i >= 0; i--) {
      const c = placedCharacters[i];
      const dist = Math.hypot(mouseX - c.x, mouseY - c.y);
      // Rough bounding circle for chibi actor
      if (dist < 110) {
        sound.playClick();
        setSelectedCharInstanceId(c.instanceId);
        setSelectedBubbleId(null);
        isDraggingRef.current = {
          type: 'character',
          id: c.instanceId,
          startX: mouseX,
          startY: mouseY,
          initialX: c.x,
          initialY: c.y,
        };
        return;
      }
    }

    // Deselect if clicked in blank space
    setSelectedCharInstanceId(null);
    setSelectedBubbleId(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current.type) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 800 / rect.width;
    const scaleY = 500 / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const dx = mouseX - isDraggingRef.current.startX;
    const dy = mouseY - isDraggingRef.current.startY;

    if (isDraggingRef.current.type === 'bubble') {
      const bubbleId = isDraggingRef.current.id;
      setSpeechBubbles((prev) =>
        prev.map((b) =>
          b.id === bubbleId
            ? {
                ...b,
                x: Math.round(isDraggingRef.current.initialX + dx),
                y: Math.round(isDraggingRef.current.initialY + dy),
              }
            : b
        )
      );
    } else if (isDraggingRef.current.type === 'character') {
      const instId = isDraggingRef.current.id;
      setPlacedCharacters((prev) =>
        prev.map((c) =>
          c.instanceId === instId
            ? {
                ...c,
                x: Math.round(isDraggingRef.current.initialX + dx),
                y: Math.round(isDraggingRef.current.initialY + dy),
              }
            : c
        )
      );
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = {
      type: null,
      id: null,
      startX: 0,
      startY: 0,
      initialX: 0,
      initialY: 0,
    };
  };

  // Add character to scene (max 3 characters)
  const handleAddCharacterToScene = (char: Character) => {
    if (placedCharacters.length >= 3) {
      alert('Maximum of 3 characters in the studio scene!');
      return;
    }
    sound.playClick();
    const newInst: StudioCharacterInstance = {
      instanceId: 'inst_' + Date.now(),
      characterId: char.id,
      character: char,
      x: 200 + placedCharacters.length * 180,
      y: 280,
      scale: 0.95,
      rotation: 0,
      flipX: false,
      pose: char.pose,
      zIndex: placedCharacters.length + 1,
    };
    setPlacedCharacters([...placedCharacters, newInst]);
    setSelectedCharInstanceId(newInst.instanceId);
  };

  const handleRemoveCharacter = (instanceId: string) => {
    sound.playClick();
    setPlacedCharacters(placedCharacters.filter((c) => c.instanceId !== instanceId));
    if (selectedCharInstanceId === instanceId) {
      setSelectedCharInstanceId(null);
    }
  };

  // Add speech bubble
  const handleAddBubble = (type: BubbleType = 'speech') => {
    sound.playClick();
    const selChar = placedCharacters.find((c) => c.instanceId === selectedCharInstanceId);
    const newBubble: SpeechBubble = {
      id: 'bubble_' + Date.now(),
      text: type === 'thought' ? 'Hmm, what should we do today...?' : 'Sugoi! Look at this scene!',
      speakerName: selChar ? selChar.character.name : '',
      x: selChar ? Math.max(20, selChar.x - 100) : 300,
      y: selChar ? Math.max(30, selChar.y - 180) : 80,
      width: 220,
      height: 70,
      type,
      tail: 'bottom_left',
      bgColor: '#ffffff',
      textColor: '#18181b',
      fontSize: 13,
    };
    setSpeechBubbles([...speechBubbles, newBubble]);
    setSelectedBubbleId(newBubble.id);
  };

  const handleRemoveBubble = (id: string) => {
    sound.playClick();
    setSpeechBubbles(speechBubbles.filter((b) => b.id !== id));
    if (selectedBubbleId === id) setSelectedBubbleId(null);
  };

  const selectedChar = placedCharacters.find((c) => c.instanceId === selectedCharInstanceId);
  const selectedBubble = speechBubbles.find((b) => b.id === selectedBubbleId);

  const handleExportPNG = () => {
    sound.playCameraShutter();
    if (canvasRef.current) {
      onQuickExport(canvasRef.current);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 flex flex-col gap-6">
      {/* Studio Top Control Bar */}
      <div className="bg-white p-4 rounded-3xl border-4 border-[#FF8CC6] shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF5DA8] text-white flex items-center justify-center shadow-md border-2 border-white">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-[#4A4A4A]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              Studio Scene <span className="text-[#FF5DA8]">Creator</span>
            </h2>
            <p className="text-xs text-gray-500">
              Pose up to 3 characters, pick anime backdrops & craft manga dialogue!
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAddBubble('speech')}
            className="px-3.5 py-2 rounded-xl bg-[#FFEBF5] hover:bg-[#FF8CC6]/30 text-[#FF5DA8] font-bold text-xs flex items-center gap-1.5 border-2 border-[#FF8CC6] transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>+ Speech Bubble</span>
          </button>
          <button
            onClick={() => handleAddBubble('thought')}
            className="px-3.5 py-2 rounded-xl bg-[#7267CB]/10 hover:bg-[#7267CB]/20 text-[#7267CB] font-bold text-xs flex items-center gap-1.5 border-2 border-[#7267CB] transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Thought Cloud</span>
          </button>
          <button
            id="btn-studio-export-png"
            onClick={handleExportPNG}
            className="px-4 py-2 rounded-xl bg-[#7267CB] text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md border-b-4 border-[#5A51A2] hover:border-b-0 hover:translate-y-1 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export PNG</span>
          </button>
        </div>
      </div>

      {/* The Big Stage & Side Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* The Comic Stage (Canvas) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="relative bg-zinc-900 rounded-3xl border-4 border-[#FF8CC6] shadow-xl overflow-hidden aspect-[16/10] max-h-[520px] select-none">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
            />

            {/* Overlay hint banner */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] text-white font-bold flex items-center gap-1.5 pointer-events-none border border-white/20">
              <Move className="w-3.5 h-3.5 text-[#FF8CC6]" />
              <span>Drag characters & bubbles anywhere on stage</span>
            </div>

            {/* Actor Count Badge */}
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-black text-[#7267CB] border-2 border-[#FF8CC6] shadow-md flex items-center gap-1">
              <span>Actors: {placedCharacters.length} / 3</span>
            </div>
          </div>

          {/* Quick Active Actor Tray */}
          <div className="bg-white p-3 rounded-2xl border-4 border-[#FF8CC6] shadow-md flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-gray-400 uppercase tracking-wider pl-1">
                Actors on Stage:
              </span>
              {placedCharacters.map((inst, idx) => (
                <div
                  key={inst.instanceId}
                  onClick={() => {
                    sound.playClick();
                    setSelectedCharInstanceId(inst.instanceId);
                    setSelectedBubbleId(null);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-xs font-bold cursor-pointer transition-all ${
                    selectedCharInstanceId === inst.instanceId
                      ? 'bg-[#FF5DA8] text-white border-[#FF5DA8] shadow-sm'
                      : 'bg-gray-50 border-gray-200 text-[#4A4A4A] hover:bg-[#FFEBF5]'
                  }`}
                >
                  <span>#{idx + 1} {inst.character.name}</span>
                  <Trash2
                    className="w-3.5 h-3.5 hover:text-red-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCharacter(inst.instanceId);
                    }}
                  />
                </div>
              ))}
            </div>

            {placedCharacters.length < 3 && (
              <button
                onClick={() => setActiveStudioTab('actors')}
                className="px-3 py-1.5 rounded-xl bg-[#FFEBF5] text-[#FF5DA8] hover:bg-[#FF8CC6]/30 border-2 border-[#FF8CC6] font-bold text-xs flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Actor</span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Inspector & Studio Controls */}
        <div className="lg:col-span-4 bg-white rounded-3xl border-4 border-[#FF8CC6] shadow-xl p-4 sm:p-5 flex flex-col gap-4">
          {/* Studio Control Tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-[#FFEBF5] p-1.5 rounded-2xl border-2 border-[#FF8CC6]/50">
            {[
              { id: 'actors', label: 'Actors', icon: <UserPlus className="w-3.5 h-3.5" /> },
              { id: 'backdrops', label: 'Backdrops', icon: <ImageIcon className="w-3.5 h-3.5" /> },
              { id: 'bubbles', label: 'Dialogue', icon: <MessageSquare className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playTabSwitch();
                  setActiveStudioTab(tab.id as 'actors' | 'backdrops' | 'bubbles');
                }}
                className={`py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 transition-all ${
                  activeStudioTab === tab.id
                    ? 'bg-[#FF5DA8] text-white shadow-inner border-2 border-white'
                    : 'text-[#888] hover:text-[#4A4A4A]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: ACTORS INSPECTOR */}
          {activeStudioTab === 'actors' && (
            <div className="flex flex-col gap-4">
              {/* Selected Character Fine-Tuning */}
              {selectedChar ? (
                <div className="flex flex-col gap-3 bg-[#FFEBF5] p-3.5 rounded-2xl border-2 border-[#FF8CC6]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#FF5DA8] uppercase">
                      Selected: {selectedChar.character.name}
                    </span>
                    <button
                      onClick={() => handleRemoveCharacter(selectedChar.instanceId)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>

                  {/* Pose Selector */}
                  <div>
                    <label className="text-[11px] font-extrabold text-[#4A4A4A] block mb-1">
                      Scene Pose:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['stand', 'peace', 'wave', 'cheer', 'cross_arms'] as PoseType[]).map((p) => (
                        <button
                          key={p}
                          onClick={() => {
                            sound.playClick();
                            setPlacedCharacters(
                              placedCharacters.map((c) =>
                                c.instanceId === selectedChar.instanceId ? { ...c, pose: p } : c
                              )
                            );
                          }}
                          className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-all ${
                            selectedChar.pose === p
                              ? 'bg-[#7267CB] text-white shadow-sm'
                              : 'bg-white text-[#4A4A4A] border border-gray-200 hover:bg-[#FFEBF5]'
                          }`}
                        >
                          {p.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scale & Flip */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setPlacedCharacters(
                            placedCharacters.map((c) =>
                              c.instanceId === selectedChar.instanceId
                                ? { ...c, scale: Math.max(0.5, Number((c.scale - 0.1).toFixed(1))) }
                                : c
                            )
                          );
                        }}
                        className="p-1.5 bg-white border border-gray-200 rounded-xl hover:bg-[#FFEBF5]"
                        title="Smaller"
                      >
                        <ZoomOut className="w-4 h-4 text-[#4A4A4A]" />
                      </button>
                      <span className="text-xs font-bold text-[#4A4A4A] w-12 text-center">
                        {Math.round(selectedChar.scale * 100)}%
                      </span>
                      <button
                        onClick={() => {
                          setPlacedCharacters(
                            placedCharacters.map((c) =>
                              c.instanceId === selectedChar.instanceId
                                ? { ...c, scale: Math.min(1.5, Number((c.scale + 0.1).toFixed(1))) }
                                : c
                            )
                          );
                        }}
                        className="p-1.5 bg-white border border-gray-200 rounded-xl hover:bg-[#FFEBF5]"
                        title="Larger"
                      >
                        <ZoomIn className="w-4 h-4 text-[#4A4A4A]" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        sound.playClick();
                        setPlacedCharacters(
                          placedCharacters.map((c) =>
                            c.instanceId === selectedChar.instanceId ? { ...c, flipX: !c.flipX } : c
                          )
                        );
                      }}
                      className={`px-3 py-1.5 rounded-xl border-2 text-xs font-bold flex items-center gap-1 ${
                        selectedChar.flipX
                          ? 'bg-[#7267CB] text-white border-[#5A51A2]'
                          : 'bg-white text-[#4A4A4A] border-gray-200 hover:bg-[#FFEBF5]'
                      }`}
                    >
                      <FlipHorizontal className="w-3.5 h-3.5" />
                      <span>Flip</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 border-2 border-dashed border-[#FF8CC6] rounded-2xl text-center text-xs text-[#888]">
                  Click any character on the stage to adjust pose, size and flip!
                </div>
              )}

              {/* Add More Saved Characters to Scene */}
              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                  Add From Saved Roster:
                </h4>
                <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {savedCharacters.map((char) => {
                    const isAlreadyOnStage = placedCharacters.some((c) => c.characterId === char.id);
                    return (
                      <div
                        key={char.id}
                        className="p-2.5 bg-gray-50 hover:bg-[#FFEBF5] rounded-2xl border-2 border-gray-100 hover:border-[#FF8CC6] flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="font-bold text-xs text-[#4A4A4A]">{char.name}</div>
                          <div className="text-[10px] text-gray-400 capitalize">{char.topStyle.replace('_', ' ')}</div>
                        </div>
                        <button
                          disabled={placedCharacters.length >= 3}
                          onClick={() => handleAddCharacterToScene(char)}
                          className="px-3 py-1 bg-[#FF5DA8] hover:bg-[#d44186] disabled:opacity-40 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Place</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BACKDROPS INSPECTOR */}
          {activeStudioTab === 'backdrops' && (
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                Select Scene Backdrop
              </h4>
              <div className="grid grid-cols-1 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {BACKDROPS.map((b) => {
                  const isUnlocked = b.unlocked || unlockedBackdrops.includes(b.id);
                  const isSelected = selectedBackdrop === b.id;

                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        if (!isUnlocked) return;
                        sound.playClick();
                        setSelectedBackdrop(b.id);
                      }}
                      className={`p-3 rounded-2xl border-2 text-left transition-all relative overflow-hidden cursor-pointer ${
                        isSelected
                          ? 'border-[#7267CB] bg-[#7267CB]/10 ring-2 ring-[#7267CB]/30'
                          : isUnlocked
                          ? 'border-gray-200 hover:border-[#FF8CC6] hover:bg-[#FFEBF5]'
                          : 'border-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-xs text-[#4A4A4A]">{b.name}</span>
                        {!isUnlocked && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 bg-[#FFF089] text-[#7A6000] rounded-md">
                            🔒 Gacha Unlock
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 bg-[#7267CB] text-white rounded-md">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-2">{b.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SPEECH BUBBLE INSPECTOR */}
          {activeStudioTab === 'bubbles' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
                  Dialogue Bubbles
                </h4>
                <button
                  onClick={() => handleAddBubble('speech')}
                  className="text-xs font-bold text-[#FF5DA8] hover:text-[#d44186] flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {selectedBubble ? (
                <div className="flex flex-col gap-3 bg-[#FFEBF5] p-3.5 rounded-2xl border-2 border-[#FF8CC6]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#FF5DA8] uppercase">
                      Edit Dialogue
                    </span>
                    <button
                      onClick={() => handleRemoveBubble(selectedBubble.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>

                  {/* Speaker Name */}
                  <div>
                    <label className="text-[11px] font-bold text-[#4A4A4A] block mb-1">
                      Speaker Tag (optional):
                    </label>
                    <input
                      type="text"
                      value={selectedBubble.speakerName}
                      onChange={(e) => {
                        setSpeechBubbles(
                          speechBubbles.map((b) =>
                            b.id === selectedBubble.id ? { ...b, speakerName: e.target.value } : b
                          )
                        );
                      }}
                      className="w-full text-xs font-bold px-3 py-1.5 bg-white border-2 border-[#FF8CC6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5DA8]"
                      placeholder="e.g. Aria, Ren..."
                    />
                  </div>

                  {/* Dialogue text */}
                  <div>
                    <label className="text-[11px] font-bold text-[#4A4A4A] block mb-1">
                      Text Message:
                    </label>
                    <textarea
                      rows={2}
                      value={selectedBubble.text}
                      onChange={(e) => {
                        setSpeechBubbles(
                          speechBubbles.map((b) =>
                            b.id === selectedBubble.id ? { ...b, text: e.target.value } : b
                          )
                        );
                      }}
                      className="w-full text-xs font-medium p-2 bg-white border-2 border-[#FF8CC6] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5DA8]"
                    />
                  </div>

                  {/* Bubble Type & Tail Direction */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 block mb-1">
                        Bubble Style:
                      </label>
                      <select
                        value={selectedBubble.type}
                        onChange={(e) => {
                          setSpeechBubbles(
                            speechBubbles.map((b) =>
                              b.id === selectedBubble.id ? { ...b, type: e.target.value as BubbleType } : b
                            )
                          );
                        }}
                        className="w-full text-xs font-bold px-2 py-1.5 bg-white border border-zinc-200 rounded-xl"
                      >
                        <option value="speech">Speech</option>
                        <option value="thought">Thought Cloud</option>
                        <option value="shout">Shout / Action</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 block mb-1">
                        Tail Pointer:
                      </label>
                      <select
                        value={selectedBubble.tail}
                        onChange={(e) => {
                          setSpeechBubbles(
                            speechBubbles.map((b) =>
                              b.id === selectedBubble.id ? { ...b, tail: e.target.value as BubbleTail } : b
                            )
                          );
                        }}
                        className="w-full text-xs font-bold px-2 py-1.5 bg-white border border-zinc-200 rounded-xl"
                      >
                        <option value="bottom_left">Bottom Left</option>
                        <option value="bottom_right">Bottom Right</option>
                        <option value="top_left">Top Left</option>
                        <option value="top_right">Top Right</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl text-center text-xs text-zinc-500">
                  Select a bubble on stage or click "+ Speech Bubble" above to create dialogue!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
