/** ファイル名 */
var ACTIVITY_FILE_NAME = null;
/** ファイルID */
var FILE_ID = null;
/** ステータス */
var RESULT_STATUS = false;

/** アクティブモード */
const MODE_ACTIVE = 1;
/** 非アクティブモード */
const MODE_INACTIVE = 2;
/** 確認モード */
const MODE_CHECK = 3;

/** GAS のPOST処理 */
function doPost(e) {
  var modeValue = 0;

  // 強制チェックモード
  if (isNull(e)) {
    modeValue = MODE_CHECK;
  } else {
    var jsonData = JSON.parse(e.postData.getDataAsString());
    modeValue = jsonData.mode_type;
  }

  // プロジェクト定数
  var sp = PropertiesService.getScriptProperties();
  ACTIVITY_FILE_NAME = sp.getProperty('activity_file_name');

  // 今の状態を確認
  checkFile();
  RESULT_STATUS = !isNull(FILE_ID);

  switch (modeValue) {
    // アクティブ化
    case MODE_ACTIVE:
      if (RESULT_STATUS) {
        updateFile();
      } else {
        uploadFile();
      }
      RESULT_STATUS = true;
    break;

    // 非アクティブ化
    case MODE_INACTIVE:
      deleteFile();
      RESULT_STATUS = false;
    break;

    // 確認モード
    case MODE_CHECK:
    break;
  }

  // 何もないので終わり
  if (isNull(e)) {
    return;
  }

  // データを返す準備
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);

  // JSON設定
  var resultStatus = {
    'result' : {
      'status' : RESULT_STATUS ? 1 : 0
    }
  };

  // JSONを返す
  output.setContent(JSON.stringify(resultStatus));
  return output;
}

/** データをアップロード */
function uploadFile() {
  try {
    var file = {
      title: ACTIVITY_FILE_NAME,
      mimeType: 'txt'
    };
    file = Drive.Files.insert(file, null);
  } catch (err) {
  }
}

/** データを更新する */
function updateFile() {
  try {
    var file = {
      title: ACTIVITY_FILE_NAME,
      mimeType: 'txt'
    };
    // ファイルIDを指定して更新
    file = Drive.Files.update(file, FILE_ID);
  } catch (err) {
  }
}

/** データを削除 */
function deleteFile() {
  try
  {
    // ファイルIDを指定して削除
    Drive.Files.trash(FILE_ID);
  } catch (err) {
  }
}

/** ファイルの存在チェック */
function checkFile() {
  // 一致するファイルを検索＆またはゴミ箱に移動された親フォルダーからゴミ箱に移動されたかどうか
  var file = Drive.Files.list().items.find(v => v.title == ACTIVITY_FILE_NAME && v.labels.trashed == false);
  if (isNull(file)) {
    return;
  }
  FILE_ID = file.id;
  Logger.log(JSON.stringify(file));
}

/** null */
function isNull(value) {
  return value == null;
}
