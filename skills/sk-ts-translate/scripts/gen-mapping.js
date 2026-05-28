#!/usr/bin/env node
/**
 * gen-mapping.js — Bridge between extract.js and apply.js
 *
 * Reads extract.js JSON output (from stdin or file), applies translation
 * dictionary for the target language, and writes the mapping JSON that
 * apply.js expects.
 *
 * Usage:
 *   node extract.js Korean.ts | node gen-mapping.js -l ko > mapping.json
 *   node gen-mapping.js extract_output.json -l it -o mapping.json
 *   node extract.js Japanese.ts | node gen-mapping.js -l ja -o mapping.json
 *
 * The translation dictionary is embedded. When translating a NEW set of TS
 * files (different software / domain), replace the dictionary content — the
 * script structure stays the same.
 *
 * Options:
 *   -l, --lang <code>    Target language code (ko, ja, it, ru, pt, es, ...)
 *   -o, --output <path>  Write to file instead of stdout
 *   -h, --help           Show help
 */

const fs = require('fs');

// ── CLI ────────────────────────────────────────────────────────────────────

function showHelp() {
    console.log(`Usage: node gen-mapping.js [input.json] -l <lang> [-o output.json]

Bridge between extract.js and apply.js. Reads extract output, applies
translations for the target language, writes apply-compatible JSON.

If no input file is given, reads from stdin.

Options:
  -l, --lang <code>    Target language (required)
  -o, --output <path>  Write to file (default: stdout)
  -h, --help           Show this help

Example pipeline:
  node extract.js Korean.ts | node gen-mapping.js -l ko -o mapping.json
  node apply.js Korean.ts mapping.json

Languages: ko, ja, it, tr, vi, ru, km, pt, es, zh_CN`);
}

const args = process.argv.slice(2);
let inputPath = null;
let outputPath = null;
let targetLang = null;

for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-l' || a === '--lang') {
        const val = args[++i];
        if (!val || val.startsWith('-')) {
            console.error('Error: -l/--lang requires a language code (e.g. ko, ja, it)');
            process.exit(1);
        }
        targetLang = val;
    } else if (a === '-o' || a === '--output') {
        const val = args[++i];
        if (!val || val.startsWith('-')) {
            console.error('Error: -o/--output requires a path argument');
            process.exit(1);
        }
        outputPath = val;
    } else if (a === '-h' || a === '--help') {
        showHelp();
        process.exit(0);
    } else if (!a.startsWith('-')) {
        inputPath = a;
    }
}

if (!targetLang) {
    console.error('Error: --lang is required. Use -h for help.');
    process.exit(1);
}

// ── Translation Dictionary ─────────────────────────────────────────────────

// Sources that should NOT be translated (numbers, codes, placeholders)
const NO_TRANSLATE = new Set([
    '0', 'ALL', 'Form', 'QEP:%1', 'QEP：', 'QEP:%1(%2°)', 'QEP:\n%1(%2°)',
    'X:728.998', 'Y:230.999',
]);

// Translation map: source -> { lang: translated }
// To translate a different software: replace this object.
const DICT = {
    '%1~%2度': {
        ko: '%1~%2도', ja: '%1～%2度', it: '%1~%2°',
        tr: '%1~%2°', vi: '%1~%2 độ', ru: '%1~%2°',
        km: '%1~%2°', pt: '%1~%2°', es: '%1~%2°',
    },
    '0~%1度或%2~360度': {
        ko: '0~%1도 또는 %2~360도', ja: '0～%1度または%2～360度',
        it: "0~%1° o %2~360°", tr: "0~%1° veya %2~360°",
        vi: '0~%1 độ hoặc %2~360 độ', ru: '0~%1° или %2~360°',
        km: '0~%1° ឬ %2~360°', pt: '0~%1° ou %2~360°',
        es: '0~%1° o %2~360°',
    },

    'X偏移量: %1': {
        ko: 'X 오프셋: %1', ja: 'Xオフセット: %1', it: 'Offset X: %1',
        tr: 'X ofseti: %1', vi: 'Độ lệch X: %1', ru: 'Смещение X: %1',
        km: 'អុហ្វសិត X: %1', pt: 'Deslocamento X: %1', es: 'Desplazamiento X: %1',
    },
    'X偏移量: 0.000': {
        ko: 'X 오프셋: 0.000', ja: 'Xオフセット: 0.000', it: 'Offset X: 0.000',
        tr: 'X ofseti: 0.000', vi: 'Độ lệch X: 0.000', ru: 'Смещение X: 0.000',
        km: 'អុហ្វសិត X: 0.000', pt: 'Deslocamento X: 0.000', es: 'Desplazamiento X: 0.000',
    },
    'Y偏移量: %1': {
        ko: 'Y 오프셋: %1', ja: 'Yオフセット: %1', it: 'Offset Y: %1',
        tr: 'Y ofseti: %1', vi: 'Độ lệch Y: %1', ru: 'Смещение Y: %1',
        km: 'អុហ្វសិត Y: %1', pt: 'Deslocamento Y: %1', es: 'Desplazamiento Y: %1',
    },
    'Y偏移量: 0.000': {
        ko: 'Y 오프셋: 0.000', ja: 'Yオフセット: 0.000', it: 'Offset Y: 0.000',
        tr: 'Y ofseti: 0.000', vi: 'Độ lệch Y: 0.000', ru: 'Смещение Y: 0.000',
        km: 'អុហ្វសិត Y: 0.000', pt: 'Deslocamento Y: 0.000', es: 'Desplazamiento Y: 0.000',
    },

    // Axis feedforward coefficients
    'X轴位置前馈变化率系数': {
        ko: 'X축 위치 피드포워드 변화율 계수', ja: 'X軸位置フィードフォワード変化率係数',
        it: 'Coeff. variazione feedforward posizione asse X',
        tr: 'X ekseni konum ileri besleme değişim oranı katsayısı',
        vi: 'Hệ số tỷ lệ thay đổi feedforward vị trí trục X',
        ru: 'Коэфф. скорости изменения упреждающей компенсации оси X',
        km: 'មេគុណអត្រាផ្លាស់ប្តូរ feedforward ទីតាំងអ័ក្ស X',
        pt: 'Coef. de variação feedforward da posição do eixo X',
        es: 'Coef. de variación feedforward de posición del eje X',
    },
    'X轴位置前馈补偿阈值': {
        ko: 'X축 위치 피드포워드 보정 임계값', ja: 'X軸位置フィードフォワード補償閾値',
        it: 'Soglia compensazione feedforward posizione asse X',
        tr: 'X ekseni konum ileri besleme telafi eşiği',
        vi: 'Ngưỡng bù feedforward vị trí trục X',
        ru: 'Порог упреждающей компенсации положения оси X',
        km: 'កម្រិតចាប់ផ្តើមសំណង feedforward ទីតាំងអ័ក្ស X',
        pt: 'Limiar de compensação feedforward da posição do eixo X',
        es: 'Umbral de compensación feedforward de posición del eje X',
    },
    'Y轴位置前馈变化率系数': {
        ko: 'Y축 위치 피드포워드 변화율 계수', ja: 'Y軸位置フィードフォワード変化率係数',
        it: 'Coeff. variazione feedforward posizione asse Y',
        tr: 'Y ekseni konum ileri besleme değişim oranı katsayısı',
        vi: 'Hệ số tỷ lệ thay đổi feedforward vị trí trục Y',
        ru: 'Коэфф. скорости изменения упреждающей компенсации оси Y',
        km: 'មេគុណអត្រាផ្លាស់ប្តូរ feedforward ទីតាំងអ័ក្ស Y',
        pt: 'Coef. de variação feedforward da posição do eixo Y',
        es: 'Coef. de variación feedforward de posición del eje Y',
    },
    'Y轴位置前馈补偿阈值': {
        ko: 'Y축 위치 피드포워드 보정 임계값', ja: 'Y軸位置フィードフォワード補償閾値',
        it: 'Soglia compensazione feedforward posizione asse Y',
        tr: 'Y ekseni konum ileri besleme telafi eşiği',
        vi: 'Ngưỡng bù feedforward vị trí trục Y',
        ru: 'Порог упреждающей компенсации положения оси Y',
        km: 'កម្រិតចាប់ផ្តើមសំណង feedforward ទីតាំងអ័ក្ស Y',
        pt: 'Limiar de compensação feedforward da posição do eixo Y',
        es: 'Umbral de compensación feedforward de posición del eje Y',
    },
    'Z轴位置前馈变化率系数': {
        ko: 'Z축 위치 피드포워드 변화율 계수', ja: 'Z軸位置フィードフォワード変化率係数',
        it: 'Coeff. variazione feedforward posizione asse Z',
        tr: 'Z ekseni konum ileri besleme değişim oranı katsayısı',
        vi: 'Hệ số tỷ lệ thay đổi feedforward vị trí trục Z',
        ru: 'Коэфф. скорости изменения упреждающей компенсации оси Z',
        km: 'មេគុណអត្រាផ្លាស់ប្តូរ feedforward ទីតាំងអ័ក្ស Z',
        pt: 'Coef. de variação feedforward da posição do eixo Z',
        es: 'Coef. de variación feedforward de posición del eje Z',
    },
    'Z轴位置前馈补偿阈值': {
        ko: 'Z축 위치 피드포워드 보정 임계값', ja: 'Z軸位置フィードフォワード補償閾値',
        it: 'Soglia compensazione feedforward posizione asse Z',
        tr: 'Z ekseni konum ileri besleme telafi eşiği',
        vi: 'Ngưỡng bù feedforward vị trí trục Z',
        ru: 'Порог упреждающей компенсации положения оси Z',
        km: 'កម្រិតចាប់ផ្តើមសំណង feedforward ទីតាំងអ័ក្ស Z',
        pt: 'Limiar de compensação feedforward da posição do eixo Z',
        es: 'Umbral de compensación feedforward de posición del eje Z',
    },

    // Direction indicators
    '上': { ko: '위', ja: '上', it: 'Su', tr: 'Yukarı', vi: 'Lên', ru: 'Вверх', km: 'ឡើង', pt: 'Cima', es: 'Arriba' },
    '下': { ko: '아래', ja: '下', it: 'Giù', tr: 'Aşağı', vi: 'Xuống', ru: 'Вниз', km: 'ចុះ', pt: 'Baixo', es: 'Abajo' },
    '左': { ko: '왼쪽', ja: '左', it: 'Sinistra', tr: 'Sol', vi: 'Trái', ru: 'Влево', km: 'ឆ្វេង', pt: 'Esquerda', es: 'Izquierda' },
    '右': { ko: '오른쪽', ja: '右', it: 'Destra', tr: 'Sağ', vi: 'Phải', ru: 'Вправо', km: 'ស្តាំ', pt: 'Direita', es: 'Derecha' },

    // Upper rotary axis
    '上旋转轴位置前馈变化率系数': {
        ko: '상부 회전축 위치 피드포워드 변화율 계수', ja: '上回転軸位置フィードフォワード変化率係数',
        it: 'Coeff. variazione feedforward posizione asse rotante superiore',
        tr: 'Üst döner eksen konum ileri besleme değişim oranı katsayısı',
        vi: 'Hệ số tỷ lệ thay đổi feedforward vị trí trục quay trên',
        ru: 'Коэфф. скорости изм. упреждающей компенсации верхней оси вращения',
        km: 'មេគុណអត្រាផ្លាស់ប្តូរ feedforward ទីតាំងអ័ក្សបង្វិលខាងលើ',
        pt: 'Coef. variação feedforward posição eixo rotativo superior',
        es: 'Coef. variación feedforward posición eje rotativo superior',
    },
    '上旋转轴位置前馈补偿阈值': {
        ko: '상부 회전축 위치 피드포워드 보정 임계값', ja: '上回転軸位置フィードフォワード補償閾値',
        it: 'Soglia compensazione feedforward posizione asse rotante superiore',
        tr: 'Üst döner eksen konum ileri besleme telafi eşiği',
        vi: 'Ngưỡng bù feedforward vị trí trục quay trên',
        ru: 'Порог упреждающей компенсации верхней оси вращения',
        km: 'កម្រិតចាប់ផ្តើមសំណង feedforward ទីតាំងអ័ក្សបង្វិលខាងលើ',
        pt: 'Limiar compensação feedforward posição eixo rotativo superior',
        es: 'Umbral compensación feedforward posición eje rotativo superior',
    },
    '下旋转轴位置前馈变化率系数': {
        ko: '하부 회전축 위치 피드포워드 변화율 계수', ja: '下回転軸位置フィードフォワード変化率係数',
        it: 'Coeff. variazione feedforward posizione asse rotante inferiore',
        tr: 'Alt döner eksen konum ileri besleme değişim oranı katsayısı',
        vi: 'Hệ số tỷ lệ thay đổi feedforward vị trí trục quay dưới',
        ru: 'Коэфф. скорости изм. упреждающей компенсации нижней оси вращения',
        km: 'មេគុណអត្រាផ្លាស់ប្តូរ feedforward ទីតាំងអ័ក្សបង្វិលខាងក្រោម',
        pt: 'Coef. variação feedforward posição eixo rotativo inferior',
        es: 'Coef. variación feedforward posición eje rotativo inferior',
    },
    '下旋转轴位置前馈补偿阈值': {
        ko: '하부 회전축 위치 피드포워드 보정 임계값', ja: '下回転軸位置フィードフォワード補償閾値',
        it: 'Soglia compensazione feedforward posizione asse rotante inferiore',
        tr: 'Alt döner eksen konum ileri besleme telafi eşiği',
        vi: 'Ngưỡng bù feedforward vị trí trục quay dưới',
        ru: 'Порог упреждающей компенсации нижней оси вращения',
        km: 'កម្រិតចាប់ផ្តើមសំណង feedforward ទីតាំងអ័ក្សបង្វិលខាងក្រោម',
        pt: 'Limiar compensação feedforward posição eixo rotativo inferior',
        es: 'Umbral compensación feedforward posición eje rotativo inferior',
    },

    '上死点显示QEP值': {
        ko: '상사점 QEP 값 표시', ja: '上死点QEP値表示', it: 'Visualizza valore QEP PMS',
        tr: 'Üst ölü nokta QEP değerini göster', vi: 'Hiển thị giá trị QEP điểm chết trên',
        ru: 'Отображение QEP в верхней мёртвой точке', km: 'បង្ហាញតម្លៃ QEP ចំណុចស្លាប់ខាងលើ',
        pt: 'Exibir valor QEP do PMS', es: 'Mostrar valor QEP del PMS',
    },

    // Middle presser foot
    '中压脚上抬开始角度': {
        ko: '중간 압착 상승 시작 각도', ja: '中押え上昇開始角度',
        it: 'Angolo inizio sollevamento piedino intermedio',
        tr: 'Orta baskı ayağı kaldırma başlangıç açısı',
        vi: 'Góc bắt đầu nâng chân vịt giữa',
        ru: 'Угол начала подъёма средней прижимной лапки',
        km: 'មុំចាប់ផ្តើមលើកជើងសង្កត់កណ្តាល',
        pt: 'Ângulo inicial de elevação do calcador intermediário',
        es: 'Ángulo inicio elevación prensatelas intermedio',
    },
    '中压脚下放结束角度': {
        ko: '중간 압착 하강 종료 각도', ja: '中押え下降終了角度',
        it: 'Angolo fine discesa piedino intermedio',
        tr: 'Orta baskı ayağı indirme bitiş açısı',
        vi: 'Góc kết thúc hạ chân vịt giữa',
        ru: 'Угол окончания опускания средней прижимной лапки',
        km: 'មុំបញ្ចប់ការចុះជើងសង្កត់កណ្តាល',
        pt: 'Ângulo final de descida do calcador intermediário',
        es: 'Ángulo fin descenso prensatelas intermedio',
    },
    '中压脚低速晚抬补偿角度': {
        ko: '중간 압착 저속 지연 상승 보정 각도', ja: '中押え低速遅延上昇補償角度',
        it: 'Angolo compensazione ritardo sollevamento piedino intermedio a bassa velocità',
        tr: 'Orta baskı ayağı düşük hız geç kaldırma telafi açısı',
        vi: 'Góc bù nâng muộn chân vịt giữa tốc độ thấp',
        ru: 'Угол компенсации запаздывания подъёма средней лапки на низкой скорости',
        km: 'មុំសំណងការលើកយឺតល្បឿនទាបជើងសង្កត់កណ្តាល',
        pt: 'Ângulo de compensação de atraso na elevação do calcador intermediário em baixa velocidade',
        es: 'Ángulo compensación retardo elevación prensatelas intermedio a baja velocidad',
    },

    // Misc UI
    '主轴校正': { ko: '주축 보정', ja: '主軸校正', it: 'Calibrazione asse principale', tr: 'Ana mil kalibrasyonu', vi: 'Hiệu chỉnh trục chính', ru: 'Калибровка главного вала', km: 'ការក្រិតអ័ក្សមេ', pt: 'Calibração do eixo principal', es: 'Calibración del eje principal' },
    '于角部延迟旋转角度阈值': {
        ko: '코너 지연 회전 각도 임계값', ja: 'コーナー遅延回転角度閾値',
        it: 'Soglia angolo rotazione ritardata angolo',
        tr: 'Köşe gecikmeli dönüş açısı eşiği', vi: 'Ngưỡng góc quay trễ tại góc',
        ru: 'Порог угла задержки поворота на углах', km: 'កម្រិតចាប់ផ្តើមមុំបង្វិលយឺតនៅជ្រុង',
        pt: 'Limiar de ângulo de rotação atrasada no canto', es: 'Umbral de ángulo de rotación retrasada en esquina',
    },
    '保存失败': { ko: '저장 실패', ja: '保存失敗', it: 'Salvataggio fallito', tr: 'Kaydetme başarısız', vi: 'Lưu thất bại', ru: 'Ошибка сохранения', km: 'រក្សាទុកបរាជ័យ', pt: 'Falha ao salvar', es: 'Error al guardar' },
    '剪线轴位置前馈变化率系数': {
        ko: '실 절단축 위치 피드포워드 변화율 계수', ja: '糸切り軸位置フィードフォワード変化率係数',
        it: 'Coeff. variazione feedforward posizione asse tagliafilo',
        tr: 'İplik kesme ekseni konum ileri besleme değişim oranı katsayısı',
        vi: 'Hệ số tỷ lệ thay đổi feedforward vị trí trục cắt chỉ',
        ru: 'Коэфф. скорости изм. упреждающей компенсации оси обрезки нити',
        km: 'មេគុណអត្រាផ្លាស់ប្តូរ feedforward ទីតាំងអ័ក្សកាត់ខ្សែ',
        pt: 'Coef. variação feedforward posição eixo corta-fio',
        es: 'Coef. variación feedforward posición eje cortahilo',
    },
    '剪线轴位置前馈补偿阈值': {
        ko: '실 절단축 위치 피드포워드 보정 임계값', ja: '糸切り軸位置フィードフォワード補償閾値',
        it: 'Soglia compensazione feedforward posizione asse tagliafilo',
        tr: 'İplik kesme ekseni konum ileri besleme telafi eşiği',
        vi: 'Ngưỡng bù feedforward vị trí trục cắt chỉ',
        ru: 'Порог упреждающей компенсации оси обрезки нити',
        km: 'កម្រិតចាប់ផ្តើមសំណង feedforward ទីតាំងអ័ក្សកាត់ខ្សែ',
        pt: 'Limiar compensação feedforward posição eixo corta-fio',
        es: 'Umbral compensación feedforward posición eje cortahilo',
    },
    '压框': { ko: '프레임 누름', ja: '枠押え', it: 'Pressa telaio', tr: 'Çerçeve baskı', vi: 'Ép khung', ru: 'Прижим рамки', km: 'សង្កត់ស៊ុម', pt: 'Prensar moldura', es: 'Prensar bastidor' },
    '压框未压警告': {
        ko: '프레임 미압착 경고', ja: '枠押え未圧着警告', it: 'Avviso pressa telaio non premuto',
        tr: 'Çerçeve basılmadı uyarısı', vi: 'Cảnh báo chưa ép khung',
        ru: 'Предупреждение: рамка не прижата', km: 'ការព្រមានមិនបានសង្កត់ស៊ុម',
        pt: 'Aviso de moldura não prensada', es: 'Advertencia de bastidor no prensado',
    },
    '压脚': { ko: '노루발', ja: '押え', it: 'Piedino', tr: 'Baskı ayağı', vi: 'Chân vịt', ru: 'Прижимная лапка', km: 'ជើងសង្កត់', pt: 'Calcador', es: 'Prensatelas' },
    '压脚随动高度': {
        ko: '노루발 추종 높이', ja: '押え追従高さ', it: 'Altezza inseguimento piedino',
        tr: 'Baskı ayağı takip yüksekliği', vi: 'Chiều cao theo chân vịt',
        ru: 'Высота следования прижимной лапки', km: 'កម្ពស់តាមដានជើងសង្កត់',
        pt: 'Altura de seguimento do calcador', es: 'Altura de seguimiento del prensatelas',
    },
    '回基准点': { ko: '기준점 복귀', ja: '基準点復帰', it: 'Ritorna al punto di riferimento', tr: 'Referans noktasına dön', vi: 'Về điểm chuẩn', ru: 'Вернуться к базовой точке', km: 'ត្រឡប់ទៅចំណុចយោង', pt: 'Voltar ao ponto de referência', es: 'Volver al punto de referencia' },

    // Long text
    '在当前界面下拆下主轴马达，旋转手轮将缝纫机针杆摇到最高点，重新装好主轴马达，确认显示的电气值在%1范围内，然后按下确定键；否则拆下主轴重复以上动作。': {
        ko: '현재 화면에서 주축 모터를 분리하고 핸드휠을 돌려 재봉기 바늘대를 최고점까지 올린 후 주축 모터를 다시 장착하십시오. 표시된 전기 값이 %1 범위 내에 있는지 확인한 후 확인 키를 누르십시오. 그렇지 않으면 주축을 분리하고 위 동작을 반복하십시오.',
        ja: '現在の画面で主軸モーターを取り外し、ハンドホイールを回してミシンの針棒を最上点まで上げ、主軸モーターを再度取り付けます。表示される電気値が%1の範囲内であることを確認し、確定キーを押してください。範囲外の場合は主軸を取り外し上記の操作を繰り返してください。',
        it: "In questa schermata, rimuovere il motore dell'asse principale, ruotare il volantino per portare la barra dell'ago al punto più alto, reinstallare il motore principale, confermare che il valore elettrico visualizzato rientri nell'intervallo %1, quindi premere OK. Altrimenti rimuovere l'asse principale e ripetere.",
        tr: 'Bu ekranda ana mil motorunu sökün, el çarkını çevirerek dikiş makinesi iğne milini en yüksek noktaya getirin, ana mil motorunu tekrar takın, görüntülenen elektrik değerinin %1 aralığında olduğunu onaylayın, ardından onay tuşuna basın; aksi takdirde ana mili söküp yukarıdaki işlemleri tekrarlayın.',
        vi: 'Trong giao diện hiện tại, tháo động cơ trục chính, xoay tay quay để đưa thanh kim máy may lên điểm cao nhất, lắp lại động cơ trục chính, xác nhận giá trị điện hiển thị nằm trong phạm vi %1, sau đó nhấn phím xác nhận; nếu không, tháo trục chính và lặp lại các thao tác trên.',
        ru: 'На текущем экране снимите двигатель главного вала, поверните маховик, чтобы поднять игловодитель швейной машины в верхнюю точку, переустановите двигатель главного вала, убедитесь, что отображаемое электрическое значение находится в диапазоне %1, затем нажмите кнопку подтверждения; в противном случае снимите главный вал и повторите вышеуказанные действия.',
        km: 'នៅក្នុងអេក្រង់បច្ចុប្បន្ន ដោះម៉ូទ័រអ័ក្សមេ បង្វិលដៃចង្កូតដើម្បីលើកដំបងម្ជុលម៉ាស៊ីនដេរទៅចំណុចខ្ពស់បំផុត ដំឡើងម៉ូទ័រអ័ក្សមេឡើងវិញ បញ្ជាក់ថាតម្លៃអគ្គិសនីដែលបង្ហាញស្ថិតក្នុងជួរ %1 បន្ទាប់មកចុចគ្រាប់ចុចយល់ព្រម; បើមិនដូច្នោះ ដោះអ័ក្សមេហើយធ្វើសកម្មភាពខាងលើម្តងទៀត។',
        pt: 'Nesta tela, remova o motor do eixo principal, gire o volante para levar a barra da agulha ao ponto mais alto, reinstale o motor do eixo principal, confirme que o valor elétrico exibido está dentro da faixa de %1 e pressione OK; caso contrário, remova o eixo principal e repita as ações acima.',
        es: 'En esta pantalla, retire el motor del eje principal, gire el volante para llevar la barra de la aguja al punto más alto, reinstale el motor del eje principal, confirme que el valor eléctrico mostrado esté dentro del rango %1 y presione OK; de lo contrario, retire el eje principal y repita las acciones anteriores.',
    },

    '基准点2超过加工范围': {
        ko: '기준점 2가 가공 범위를 초과함', ja: '基準点2が加工範囲を超えています',
        it: "Punto di riferimento 2 fuori dall'area di lavoro",
        tr: 'Referans noktası 2 işleme aralığını aşıyor', vi: 'Điểm chuẩn 2 vượt quá phạm vi gia công',
        ru: 'Базовая точка 2 выходит за пределы рабочей области', km: 'ចំណុចយោង 2 លើសពីជួរដំណើរការ',
        pt: 'Ponto de referência 2 excede a área de trabalho', es: 'Punto de referencia 2 excede el área de trabajo',
    },
    '基准设置': { ko: '기준 설정', ja: '基準設定', it: 'Impostazione riferimento', tr: 'Referans ayarı', vi: 'Cài đặt chuẩn', ru: 'Настройка базы', km: 'ការកំណត់យោង', pt: 'Configuração de referência', es: 'Configuración de referencia' },
    '处理旋转角度出错!': {
        ko: '회전 각도 처리 오류!', ja: '回転角度処理エラー!', it: 'Errore elaborazione angolo di rotazione!',
        tr: 'Dönüş açısı işleme hatası!', vi: 'Lỗi xử lý góc quay!', ru: 'Ошибка обработки угла поворота!',
        km: 'កំហុសក្នុងដំណើរការមុំបង្វិល!', pt: 'Erro ao processar ângulo de rotação!',
        es: 'Error al procesar ángulo de rotación!',
    },
    '底线检测': { ko: '밑실 감지', ja: '下糸検出', it: 'Rilevamento filo inferiore', tr: 'Alt iplik algılama', vi: 'Phát hiện chỉ dưới', ru: 'Обнаружение нижней нити', km: 'រកឃើញខ្សែក្រោម', pt: 'Detecção de linha inferior', es: 'Detección de hilo inferior' },
    '度': { ko: '도', ja: '度', it: '°', tr: '°', vi: 'độ', ru: '°', km: '°', pt: '°', es: '°' },

    '打开加工文件失败!\n错误码F%１ %2': {
        ko: '가공 파일 열기 실패!\n오류 코드 F%1 %2',
        ja: '加工ファイルのオープンに失敗しました!\nエラーコード F%1 %2',
        it: 'Apertura file di lavorazione fallita!\nCodice errore F%1 %2',
        tr: 'İşleme dosyası açılamadı!\nHata kodu F%1 %2',
        vi: 'Mở file gia công thất bại!\nMã lỗi F%1 %2',
        ru: 'Ошибка открытия файла обработки!\nКод ошибки F%1 %2',
        km: 'បើកឯកសារដំណើរការបរាជ័យ!\nកូដកំហុស F%1 %2',
        pt: 'Falha ao abrir arquivo de processamento!\nCódigo de erro F%1 %2',
        es: 'Error al abrir archivo de procesamiento!\nCódigo de error F%1 %2',
    },
    '数据超出范围!': { ko: '데이터가 범위를 초과했습니다!', ja: 'データが範囲を超えています!', it: 'Dati fuori intervallo!', tr: 'Veri aralık dışında!', vi: 'Dữ liệu vượt quá phạm vi!', ru: 'Данные вне допустимого диапазона!', km: 'ទិន្នន័យលើសពីជួរ!', pt: 'Dados fora do intervalo!', es: 'Datos fuera de rango!' },
    '文件为空！': { ko: '파일이 비어 있습니다!', ja: 'ファイルが空です!', it: 'File vuoto!', tr: 'Dosya boş!', vi: 'File trống!', ru: 'Файл пуст!', km: 'ឯកសារទទេ!', pt: 'Arquivo vazio!', es: 'Archivo vacío!' },

    '断电重启后将进入触摸屏校准模式，\n校准时请依次点击屏幕上的十字光标': {
        ko: '전원을 껐다 켜면 터치스크린 보정 모드로 진입합니다.\n보정 시 화면의 십자 커서를 순서대로 클릭하십시오.',
        ja: '電源を再起動するとタッチパネル調整モードに入ります。\n調整時は画面上の十字カーソルを順にクリックしてください。',
        it: 'Dopo il riavvio si entrerà in modalità calibrazione touch.\nDurante la calibrazione toccare in sequenza i mirini sullo schermo.',
        tr: 'Yeniden başlatmadan sonra dokunmatik ekran kalibrasyon moduna girilecektir.\nKalibrasyon sırasında ekrandaki artı imleçlere sırayla tıklayın.',
        vi: 'Sau khi khởi động lại sẽ vào chế độ hiệu chỉnh màn hình cảm ứng.\nKhi hiệu chỉnh, hãy lần lượt chạm vào con trỏ chữ thập trên màn hình.',
        ru: 'После перезапуска будет запущен режим калибровки сенсорного экрана.\nПри калибровке последовательно нажимайте на перекрестия на экране.',
        km: 'បន្ទាប់ពីចាប់ផ្តើមឡើងវិញ នឹងចូលទៅក្នុងរបៀបក្រិតអេក្រង់ប៉ះ។\nកំឡុងពេលក្រិត សូមចុចលើសញ្ញាកាកបាទនៅលើអេក្រង់តាមលំដាប់។',
        pt: 'Após reiniciar, entrará no modo de calibração da tela sensível ao toque.\nDurante a calibração, clique nos cursores em cruz na tela em sequência.',
        es: 'Después de reiniciar, entrará en el modo de calibración de pantalla táctil.\nDurante la calibración, toque secuencialmente los cursores en cruz en la pantalla.',
    },
    '机械值：': { ko: '기계 값:', ja: '機械値:', it: 'Valore meccanico:', tr: 'Mekanik değer:', vi: 'Giá trị cơ khí:', ru: 'Механическое значение:', km: 'តម្លៃមេកានិច:', pt: 'Valor mecânico:', es: 'Valor mecánico:' },
    '校准值：': { ko: '보정 값:', ja: '校正値:', it: 'Valore calibrazione:', tr: 'Kalibrasyon değeri:', vi: 'Giá trị hiệu chỉnh:', ru: 'Калибровочное значение:', km: 'តម្លៃក្រិត:', pt: 'Valor de calibração:', es: 'Valor de calibración:' },
    '校正后需要断电重启校正值才生效': {
        ko: '보정 후 전원을 껐다 켜야 보정 값이 적용됩니다',
        ja: '校正後は電源を再起動しないと校正値が有効になりません',
        it: 'Dopo la calibrazione riavviare per applicare i valori',
        tr: 'Kalibrasyondan sonra değerlerin geçerli olması için yeniden başlatılmalıdır',
        vi: 'Sau khi hiệu chỉnh cần khởi động lại để giá trị hiệu chỉnh có hiệu lực',
        ru: 'После калибровки необходимо перезагрузить устройство для применения значений',
        km: 'បន្ទាប់ពីក្រិតរួច ត្រូវចាប់ផ្តើមឡើងវិញដើម្បីឱ្យតម្លៃក្រិតមានប្រសិទ្ធភាព',
        pt: 'Após a calibração, reinicie para que os valores tenham efeito',
        es: 'Después de la calibración, reinicie para que los valores surtan efecto',
    },
    '段跳转': { ko: '세그먼트 점프', ja: 'セグメントジャンプ', it: 'Salto segmento', tr: 'Segment atlama', vi: 'Nhảy đoạn', ru: 'Пропуск сегмента', km: 'លោតផ្នែក', pt: 'Salto de segmento', es: 'Salto de segmento' },
    '电气值：': { ko: '전기 값:', ja: '電気値:', it: 'Valore elettrico:', tr: 'Elektrik değeri:', vi: 'Giá trị điện:', ru: 'Электрическое значение:', km: 'តម្លៃអគ្គិសនី:', pt: 'Valor elétrico:', es: 'Valor eléctrico:' },
    '确定': { ko: '확인', ja: '確定', it: 'OK', tr: 'Onay', vi: 'Xác nhận', ru: 'ОК', km: 'យល់ព្រម', pt: 'OK', es: 'Aceptar' },
    '确定进行主轴校正？': {
        ko: '주축 보정을 진행하시겠습니까?', ja: '主軸校正を実行しますか?',
        it: "Procedere con la calibrazione dell'asse principale?", tr: 'Ana mil kalibrasyonu yapılsın mı?',
        vi: 'Xác nhận tiến hành hiệu chỉnh trục chính?', ru: 'Выполнить калибровку главного вала?',
        km: 'យល់ព្រមធ្វើការក្រិតអ័ក្សមេ?', pt: 'Confirmar calibração do eixo principal?',
        es: '¿Confirmar calibración del eje principal?',
    },
    '花样为空': { ko: '패턴이 비어 있습니다', ja: '模様が空です', it: 'Disegno vuoto', tr: 'Desen boş', vi: 'Mẫu trống', ru: 'Узор пуст', km: 'លំនាំទទេ', pt: 'Padrão vazio', es: 'Patrón vacío' },
    '花样格式有误': { ko: '패턴 형식 오류', ja: '模様フォーマットエラー', it: 'Formato disegno errato', tr: 'Desen formatı hatalı', vi: 'Định dạng mẫu không đúng', ru: 'Неверный формат узора', km: 'ទម្រង់លំនាំមិនត្រឹមត្រូវ', pt: 'Formato de padrão inválido', es: 'Formato de patrón incorrecto' },
    '花样解析失败': { ko: '패턴 해석 실패', ja: '模様解析失敗', it: 'Analisi disegno fallita', tr: 'Desen çözümleme başarısız', vi: 'Phân tích mẫu thất bại', ru: 'Ошибка разбора узора', km: 'ការវិភាគលំនាំបរាជ័យ', pt: 'Falha na análise do padrão', es: 'Error al analizar patrón' },
    '设为基准': { ko: '기준으로 설정', ja: '基準に設定', it: 'Imposta come riferimento', tr: 'Referans olarak ayarla', vi: 'Đặt làm chuẩn', ru: 'Установить как базу', km: 'កំណត់ជាយោង', pt: 'Definir como referência', es: 'Establecer como referencia' },
    '设置基准点1': { ko: '기준점 1 설정', ja: '基準点1を設定', it: 'Imposta punto di riferimento 1', tr: "Referans noktası 1'i ayarla", vi: 'Đặt điểm chuẩn 1', ru: 'Задать базовую точку 1', km: 'កំណត់ចំណុចយោង 1', pt: 'Definir ponto de referência 1', es: 'Establecer punto de referencia 1' },
    '设置基准点2': { ko: '기준점 2 설정', ja: '基準点2を設定', it: 'Imposta punto di riferimento 2', tr: "Referans noktası 2'yi ayarla", vi: 'Đặt điểm chuẩn 2', ru: 'Задать базовую точку 2', km: 'កំណត់ចំណុចយោង 2', pt: 'Definir ponto de referência 2', es: 'Establecer punto de referencia 2' },
    '锁主轴': { ko: '주축 잠금', ja: '主軸ロック', it: 'Blocca asse principale', tr: 'Ana mil kilitle', vi: 'Khóa trục chính', ru: 'Блокировка главного вала', km: 'ចាក់សោអ័ក្សមេ', pt: 'Travar eixo principal', es: 'Bloquear eje principal' },
};

// ── Language normalization ──────────────────────────────────────────────────

const LANG_ALIASES = {
    ko: 'ko', kr: 'ko', korean: 'ko',
    ja: 'ja', jp: 'ja', japanese: 'ja',
    it: 'it', italian: 'it',
    tr: 'tr', turkish: 'tr',
    vi: 'vi', vietnamese: 'vi',
    ru: 'ru', russian: 'ru',
    km: 'km', khmer: 'km',
    pt: 'pt', portuguese: 'pt',
    es: 'es', spanish: 'es',
    zh_CN: 'zh_CN', 'zh-cn': 'zh_CN', chinese: 'zh_CN',
};

function normalizeLang(raw) {
    const key = raw.toLowerCase().replace(/_/g, '-');
    return LANG_ALIASES[raw] || LANG_ALIASES[key] || raw;
}

// ── Translation lookup ─────────────────────────────────────────────────────

function translate(source, lang) {
    if (NO_TRANSLATE.has(source)) return source;
    if (lang === 'zh_CN') return source;

    const entry = DICT[source];
    if (!entry) {
        console.error(`Warning: no entry for "${source.substring(0, 60)}" in dictionary`);
        return source;
    }

    const trans = entry[lang];
    if (trans === undefined) {
        console.error(`Warning: "${source.substring(0, 40)}" has no ${lang} translation`);
        return source;
    }
    return trans;
}

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
    let raw;
    try {
        if (inputPath) {
            raw = fs.readFileSync(inputPath, 'utf-8');
        } else {
            raw = fs.readFileSync(0, 'utf-8'); // stdin
        }
    } catch (e) {
        console.error('Error reading input: ' + e.message);
        process.exit(1);
    }

    let entries;
    try {
        // extract.js outputs stderr + stdout; find the JSON array
        const start = raw.indexOf('[');
        const end = raw.lastIndexOf(']');
        if (start === -1 || end === -1) {
            throw new Error('No JSON array found in input');
        }
        entries = JSON.parse(raw.slice(start, end + 1));
    } catch (e) {
        // Try parsing directly (clean JSON case)
        try {
            entries = JSON.parse(raw);
        } catch (e2) {
            console.error('Error: Cannot parse input as JSON array.');
            console.error('  First error:', e.message);
            console.error('  Make sure input is from extract.js');
            process.exit(1);
        }
    }

    if (!Array.isArray(entries)) {
        console.error('Error: Input must be a JSON array of {src, trans} objects');
        process.exit(1);
    }

    const normLang = normalizeLang(targetLang);
    console.error(`Target language: ${normLang}`);
    console.error(`Entries to translate: ${entries.length}`);

    const untranslated = entries.filter(e => !DICT[e.src] && !NO_TRANSLATE.has(e.src));
    if (untranslated.length > 0) {
        console.error(`\nWARNING: ${untranslated.length} source(s) not in dictionary:`);
        untranslated.forEach(e => console.error(`  - ${e.src.substring(0, 80)}`));
        console.error('');
    }

    const result = entries.map(e => ({
        src: e.src,
        trans: translate(e.src, normLang),
    }));

    const json = JSON.stringify(result, null, 2);

    if (outputPath) {
        try {
            fs.writeFileSync(outputPath, json, 'utf-8');
            console.error(`Wrote: ${outputPath}`);
        } catch (e) {
            console.error('Error writing output: ' + e.message);
            process.exit(1);
        }
    } else {
        console.log(json);
    }
}

main();
