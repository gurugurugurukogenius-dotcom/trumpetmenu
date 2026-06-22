import { PracticeMenuDef, RoutineTemplate, PracticeLog } from './types';

export const PRACTICE_MENUS: PracticeMenuDef[] = [
  {
    id: 'long_tone',
    name: 'ロングトーン',
    category: 'tone',
    description: '1つの音を長く真っ直ぐ伸ばして出し、音色の安定性とアンブシュアの持久力を養います。',
    purpose: '音色向上・アンブシュア（唇・口の周りの筋肉）のフォーム維持',
    tips: '音が揺れないよう、安定した息の支え（腹式呼吸）を意識します。メーターでピッチ（音程）が狂っていないか確認すると効果的です。',
    subItems: ['低音域ロングトーン', '中音域ロングトーン', '高音域ロングトーン']
  },
  {
    id: 'mouthpiece_buzzing',
    name: 'マウスピース・バズィング',
    category: 'tone',
    description: 'マウスピースだけで唇を振動させて音を出します。楽器本体に通す前のピュアなピッチコントロールを意識します。',
    purpose: 'ピッチ感の向上、余分な力みの除去',
    tips: '息の流れだけで自然な振動を作るように心がけましょう。高音や低音へなめらかにスライドさせたり、簡単なメロディを正確にバズィングします。',
    subItems: ['ピッチキープ（一定音）', 'サイレン（高低スライド）', '簡単なメロディ吹奏']
  },
  {
    id: 'lip_slur',
    name: 'リップスラー',
    category: 'flexibility',
    description: 'ピストン（バルブ）を押さえたまま、アンブシュアと息圧の変化だけで音程を移動させます。',
    purpose: '唇の柔軟性（フレキシビリティ）と高低のコントロール',
    tips: 'ピストンを半分押した状態にせず、アンブシュアを過剰に締めすぎず、息の「スピード」の緩急でなめらかに音を繋ぎます。',
    subItems: ['2度跳躍（5度上下）', '3度跳躍（オクターブ）', '全音階リップスラー（アルペジオ）']
  },
  {
    id: 'scale_practice',
    name: '指慣らしとスケール',
    category: 'technique',
    description: 'メジャースケール、マイナースケールなどを様々なテンポやパターン（3度、スタッカートなど）で昇降します。',
    purpose: '正確なフィンガリングと音感、全調の習得',
    tips: '指だけでボタンを「叩く」ように俊敏に押し下げます。音が途切れたり、フィンガリングが息のタイミングとズレないようにします。',
    subItems: ['Cメジャー/Aマイナー', 'サークル・オブ・フィフス（5度圏）', '3度・スタッカート・フィンガリング']
  },
  {
    id: 'single_tonguing',
    name: 'シングルタンギング',
    category: 'articulation',
    description: '「Tu/Tu/Tu」または「Te/Te/Te」の発音で、ハッキリとした音の輪郭と正確なスピードを追求します。',
    purpose: '標準的なタンギングのスピードとクリアさの強化',
    tips: '舌の先端近くで歯ぐきの裏を軽く触れるイメージ。息の圧力を止めずに、流れる息を舌でそっと区切るように吹きます。',
    subItems: ['シングルの連打（一定息圧）', '4分/8分/16分音符混合', 'アクセント＆スタッカートコントロール']
  },
  {
    id: 'double_tonguing',
    name: 'ダブルタンギング',
    category: 'articulation',
    description: '「T-K-T-K」または「Te-Ke-Te-Ke」の発音を用いて、シングルでは追いつかない高速な発音を行います。',
    purpose: '高速で安定したダブルタンギングの習得',
    tips: '「K」の音が「T」に比べて弱くなったり、音色が濁ったりしやすいので、Kだけでもハッキリ発音できる練習を挟みましょう。',
    subItems: ['T-K交互発音（低中音）', 'K音単体の強化音型', 'オクターブ往来の高速ダブル']
  },
  {
    id: 'triple_tonguing',
    name: 'トリプルタンギング',
    category: 'articulation',
    description: '「T-K-T T-K-T」または「T-T-K T-T-K」の発音で、3連符のクリアな連続発音を訓練します。',
    purpose: '3拍子系の高速タンギングのコントロール',
    tips: 'アクセントが均等になるようにメトロノームにピッタリ合わせます。3つずつのグループの頭が乱れないように！',
    subItems: ['T-K-T パターン', 'T-T-K パターン', '混合トリプル']
  },
  {
    id: 'high_register',
    name: '高音域トレーニング (ハイノート)',
    category: 'range',
    description: '五線譜の上の「G」音以上のハイトーンに息のスピードを高めてアプローチします。過度なプレスは避けます。',
    purpose: 'ハイトーンのレンジ拡大、高音での音色キープ',
    tips: 'マウスピースを唇に無理やり押し付けるのを防ぎ、口の容積（舌の位置「Ah -> Ee」）を小さくして、空気의 スピードを鋭くします。',
    subItems: ['High G音の安定化', 'High Bb/Cへのアプローチ', 'ハイトーンロングトーン']
  },
  {
    id: 'low_register',
    name: '低音域＆ペダルトーン',
    category: 'range',
    description: '豊かな息を送り込み、最低音以下のペダルトーン音域をリラックスしてたっぷり響かせます。',
    purpose: 'アンブシュアのリラックス、豊かな響きに必要なブレス量の獲得',
    tips: '唇をリラックスさせ、あたたかく太い息を吹き込みます。ペダルトーンを練習した後はアンブシュアが心地よくほぐれます。',
    subItems: ['低音の極小音量発音', 'ペダルトーン F-F#', '低音域全押し（リラックス＆ブレス）']
  },
  {
    id: 'custom_free_practice',
    name: 'カスタム自由練習',
    category: 'custom',
    description: '内容は自由に設定可能。自分の課題曲や、特定のフレーズ、独自のハノン等を練習します。',
    purpose: '個別の課題克服やウォームアップの微調整',
    tips: '自分の課題を意識して、チェックリストをご自身でカスタマイズしてください。下の「チェックリストの編集」でさらなるサブ項目の追加・削除が可能です。',
    subItems: ['フレーズ練習', 'ハノン・エチュード等', '苦手箇所の部分練習']
  }
];

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: 'routine_15',
    name: '15分 ミニマル基礎練習',
    durationLabel: '15分',
    durationMinutes: 15,
    description: '忙しい日や本番前のウォームアップに最適。トーンの安定と唇のほぐしに焦点を当てた厳選メニュー。',
    items: [
      { id: '15_buzz', menuId: 'mouthpiece_buzzing', targetMinutes: 3, recommendedTempoMin: 60, recommendedTempoMax: 80, selectedSubItems: ['ピッチキープ（一定音）', 'サイレン（高低スライド）', '簡単なメロディ吹奏'] },
      { id: '15_long', menuId: 'long_tone', targetMinutes: 5, recommendedTempoMin: 60, recommendedTempoMax: 70, selectedSubItems: ['低音域ロングトーン', '中音域ロングトーン', '高音域ロングトーン'] },
      { id: '15_slur', menuId: 'lip_slur', targetMinutes: 4, recommendedTempoMin: 70, recommendedTempoMax: 90, selectedSubItems: ['2度跳躍（5度上下）', '3度跳躍（オクターブ）'] },
      { id: '15_scale', menuId: 'scale_practice', targetMinutes: 3, recommendedTempoMin: 80, recommendedTempoMax: 100, selectedSubItems: ['Cメジャー/Aマイナー'] }
    ]
  },
  {
    id: 'routine_30',
    name: '30分 スタンダード基礎練習',
    durationLabel: '30分',
    durationMinutes: 30,
    description: 'バランス良く全身の基礎能力を底上げする、毎日の定番トレーニングルーティン。',
    items: [
      { id: '30_buzz', menuId: 'mouthpiece_buzzing', targetMinutes: 3, recommendedTempoMin: 60, recommendedTempoMax: 80, selectedSubItems: ['ピッチキープ（一定音）', 'サイレン（高低スライド）', '簡単なメロディ吹奏'] },
      { id: '30_long', menuId: 'long_tone', targetMinutes: 7, recommendedTempoMin: 60, recommendedTempoMax: 70, selectedSubItems: ['低音域ロングトーン', '中音域ロングトーン', '高音域ロングトーン'] },
      { id: '30_slur', menuId: 'lip_slur', targetMinutes: 7, recommendedTempoMin: 72, recommendedTempoMax: 100, selectedSubItems: ['2度跳躍（5度上下）', '3度跳躍（オクターブ）', '全音階リップスラー（アルペジオ）'] },
      { id: '30_scale', menuId: 'scale_practice', targetMinutes: 7, recommendedTempoMin: 80, recommendedTempoMax: 120, selectedSubItems: ['Cメジャー/Aマイナー', 'サークル・オブ・フィフス（5度圏）', '3度・スタッカート・フィンガリング'] },
      { id: '30_single', menuId: 'single_tonguing', targetMinutes: 6, recommendedTempoMin: 90, recommendedTempoMax: 140, selectedSubItems: ['シングルの連打（一定息圧）', '4分/8分/16分音符混合'] }
    ]
  },
  {
    id: 'routine_60',
    name: '60分 フル・アスリート基礎練習',
    durationLabel: '60分',
    durationMinutes: 60,
    description: '音色、テクニック、タンギング、音域をすべて網羅し、トランペット奏者としての実力を本格的に磨き上げるメニュー。',
    items: [
      { id: '60_buzz', menuId: 'mouthpiece_buzzing', targetMinutes: 5, recommendedTempoMin: 60, recommendedTempoMax: 80, selectedSubItems: ['ピッチキープ（一定音）', 'サイレン（高低スライド）', '簡単なメロディ吹奏'] },
      { id: '60_long', menuId: 'long_tone', targetMinutes: 12, recommendedTempoMin: 60, recommendedTempoMax: 70, selectedSubItems: ['低音域ロングトーン', '中音域ロングトーン', '高音域ロングトーン'] },
      { id: '60_slur', menuId: 'lip_slur', targetMinutes: 12, recommendedTempoMin: 72, recommendedTempoMax: 110, selectedSubItems: ['2度跳躍（5度上下）', '3度跳躍（オクターブ）', '全音階リップスラー（アルペジオ）'] },
      { id: '60_scale', menuId: 'scale_practice', targetMinutes: 10, recommendedTempoMin: 80, recommendedTempoMax: 140, selectedSubItems: ['Cメジャー/Aマイナー', 'サークル・オブ・フィフス（5度圏）', '3度・スタッカート・フィンガリング'] },
      { id: '60_single', menuId: 'single_tonguing', targetMinutes: 7, recommendedTempoMin: 90, recommendedTempoMax: 144, selectedSubItems: ['シングルの連打（一定息圧）', '4分/8分/16分音符混合', 'アクセント＆スタッカートコントロール'] },
      { id: '60_double', menuId: 'double_tonguing', targetMinutes: 6, recommendedTempoMin: 110, recommendedTempoMax: 160, selectedSubItems: ['T-K交互発音（低中音）', 'K音単体の強化音型'] },
      { id: '60_high', menuId: 'high_register', targetMinutes: 4, recommendedTempoMin: 70, recommendedTempoMax: 90, selectedSubItems: ['High G音の安定化', 'High Bb/Cへのアプローチ'] },
      { id: '60_low', menuId: 'low_register', targetMinutes: 4, recommendedTempoMin: 60, recommendedTempoMax: 80, selectedSubItems: ['低音の極小音量発音', 'ペダルトーン F-F#', '低音域全押し（リラックス＆ブレス）'] }
    ]
  }
];

// Helper to generate some beautiful background practice history for the user (last 10 days)
export const generateMockLogs = (): PracticeLog[] => {
  const logs: PracticeLog[] = [];
  const today = new Date();

  // Create logs from (today - 12 days) to (today - 1 day)
  for (let i = 12; i >= 1; i--) {
    const practiceDate = new Date();
    practiceDate.setDate(today.getDate() - i);
    const dateStr = practiceDate.toISOString().split('T')[0];
    const timestamp = practiceDate.getTime();

    // 15, 30 or 60 minute routine logs
    // On weekends we did 60 minutes, on weekdays mostly 30 or 15 minutes
    const dayOfWeek = practiceDate.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const baseTempoOffset = 12 - i; // Gradually improving tempos

    if (isWeekend) {
      logs.push({
        id: `mock_mouthpiece_${i}`,
        date: dateStr,
        timestamp,
        menuId: 'mouthpiece_buzzing',
        menuName: 'マウスピース・バズィング',
        tempo: 68 + Math.floor(Math.random() * 5),
        rating: Math.random() > 0.1 ? 'success' : 'needs_improvement',
        notes: '音がふらつかずにバズを維持できた。音の跳躍の際に、中間の息の流れを意識した。',
        durationMinutes: 5,
        completedSubItems: ['ピッチキープ（一定音）', 'サイレン（高低スライド）']
      });
      logs.push({
        id: `mock_long_${i}`,
        date: dateStr,
        timestamp,
        menuId: 'long_tone',
        menuName: 'ロングトーン',
        tempo: 60,
        rating: 'success',
        notes: 'チューナーを見てピッチをしっかり安定させることができた。',
        durationMinutes: 12,
        completedSubItems: ['低音域ロングトーン', '中音域ロングトーン']
      });
      logs.push({
        id: `mock_slur_${i}`,
        date: dateStr,
        timestamp,
        menuId: 'lip_slur',
        menuName: 'リップスラー',
        tempo: 80 + baseTempoOffset,
        rating: Math.random() > 0.4 ? 'success' : 'needs_improvement',
        notes: 'Gから高音Cへのリップスラーがまだ喉が締まりやすい。息のスピードを維持する。',
        durationMinutes: 12,
        completedSubItems: ['2度跳躍（5度上下）', '3度跳躍（オクターブ）']
      });
      logs.push({
        id: `mock_scale_${i}`,
        date: dateStr,
        timestamp,
        menuId: 'scale_practice',
        menuName: '指慣らしとスケール',
        tempo: 100 + baseTempoOffset * 2,
        rating: Math.random() > 0.2 ? 'success' : 'needs_improvement',
        notes: 'F#メジャースケールを重点的に。薬指のピストン下降時にズレが生じやすいので要練習。',
        durationMinutes: 10,
        completedSubItems: ['Cメジャー/Aマイナー', 'サークル・オブ・フィフス（5度圏）']
      });
      logs.push({
        id: `mock_single_${i}`,
        date: dateStr,
        timestamp,
        menuId: 'single_tonguing',
        menuName: 'シングルタンギング',
        tempo: 108 + baseTempoOffset * 1.5,
        rating: 'success',
        notes: '舌先に余分な力を入れず、息の圧力で吹けた。',
        durationMinutes: 7,
        completedSubItems: ['シングルの連打（一定息圧）']
      });
    } else {
      const durationType = dayOfWeek % 2 === 0 ? 30 : 15;
      
      logs.push({
        id: `mock_long_${i}`,
        date: dateStr,
        timestamp,
        menuId: 'long_tone',
        menuName: 'ロングトーン',
        tempo: 60,
        rating: Math.random() > 0.2 ? 'success' : 'needs_improvement',
        notes: '平日にしては息が安定しているが、低音のロングトーン時に少し唇が緩む。',
        durationMinutes: durationType === 30 ? 7 : 5,
        completedSubItems: ['低音域ロングトーン', '中音域ロングトーン']
      });

      logs.push({
        id: `mock_slur_${i}`,
        date: dateStr,
        timestamp,
        menuId: 'lip_slur',
        menuName: 'リップスラー',
        tempo: 76 + baseTempoOffset,
        rating: Math.random() > 0.3 ? 'success' : (Math.random() > 0.5 ? 'needs_improvement' : 'fail'),
        notes: 'テンポを少し落として正確さを重視。リップスラー時のブレスサポートが不足ぎみ。',
        durationMinutes: durationType === 30 ? 7 : 4,
        completedSubItems: ['2度跳躍（5度上下）']
      });

      logs.push({
        id: `mock_scale_${i}`,
        date: dateStr,
        timestamp,
        menuId: 'scale_practice',
        menuName: '指慣らしとスケール',
        tempo: 96 + baseTempoOffset * 1.5,
        rating: 'success',
        notes: 'テンポにピッタリ乗って指がまわった。調を変えてもクリア。',
        durationMinutes: durationType === 30 ? 7 : 3,
        completedSubItems: ['Cメジャー/Aマイナー']
      });

      if (durationType === 30) {
        logs.push({
          id: `mock_single_${i}`,
          date: dateStr,
          timestamp,
          menuId: 'single_tonguing',
          menuName: 'シングルタンギング',
          tempo: 104 + baseTempoOffset,
          rating: 'needs_improvement',
          notes: '連符後半で舌が硬直してテンポより遅れる。力を抜いて「Tu」をササヤクように。',
          durationMinutes: 6,
          completedSubItems: ['シングルの連打（一定息圧）']
        });
      }
    }
  }

  return logs;
};
