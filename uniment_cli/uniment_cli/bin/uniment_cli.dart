// bin/uniment_cli.dart
import 'dart:io';
import 'package:colorize/colorize.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';

void main(List<String> arguments) async {
  final cli = UnimentCLI();
  await cli.run();
}

class UnimentCLI {
  final String baseUrl = 'http://uniment.site:5555/api';
  final http.Client client = http.Client();
  bool isRunning = true;

  // HTTP 클라이언트 설정
  Future<http.Response> getWithTimeout(String url) {
    return client.get(Uri.parse(url)).timeout(
      Duration(seconds: 10),
      onTimeout: () {
        throw TimeoutException('요청 시간이 초과되었습니다.');
      },
    );
  }

  Future<void> run() async {
    while (isRunning) {
      try {
        clearScreen();
        printBanner();
        await showMainMenu();
      } catch (e) {
        printError('오류가 발생했습니다: $e');
        await Future.delayed(Duration(seconds: 2));
      }
    }
  }

  void clearScreen() {
    if (Platform.isWindows) {
      print(Process.runSync('cls', [], runInShell: true).stdout);
    } else {
      print(Process.runSync('clear', [], runInShell: true).stdout);
    }
  }

  void printBanner() {
    final banner = '''
╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮
│         UNIMENT CLI DEMO         │
│   Backend: Node.js + MongoDB     │
│   Frontend: Flutter + Dart       │
│   Server: AWS EC2 + Docker       │
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
    ''';
    print(Colorize(banner).blue().bold());
  }

  Future<void> showMainMenu() async {
    print('\n📚 메인 메뉴\n');
    final options = [
      '1. 과목 관리 시스템',
      '2. 포트폴리오 관리',
      '3. 졸업요건 분석',
      '4. 자기소개서 관리',
      '5. 종료'
    ];

    options.forEach(print);
    print('\n선택해주세요 (1-5): ');

    final input = stdin.readLineSync();
    await handleMainMenuInput(input);
  }

  Future<void> handleMainMenuInput(String? input) async {
    switch (input) {
      case '1':
        await manageCourses();
        break;
      case '2':
        await managePortfolio();
        break;
      case '3':
        await analyzeGraduation();
        break;
      case '4':
        await manageResumes();
        break;
      case '5':
        exit(0);
      default:
        printError('잘못된 입력입니다.');
        await Future.delayed(Duration(seconds: 1));
    }
    await pressEnterToContinue();
  }

  Future<void> manageCourses() async {
    clearScreen();
    print('\n=== 📚 과목 관리 시스템 ===\n');

    final options = ['1. 전체 과목 조회', '2. 과목 검색', '3. 돌아가기'];

    options.forEach(print);
    print('\n선택해주세요 (1-3): ');

    final input = stdin.readLineSync();
    await handleCoursesInput(input);
  }

  Future<void> handleCoursesInput(String? input) async {
    switch (input) {
      case '1':
        await showAllCourses();
        break;
      case '2':
        await searchCourses();
        break;
      case '3':
        return;
      default:
        printError('잘못된 입력입니다.');
    }
    await pressEnterToContinue();
  }

  Future<void> showAllCourses() async {
    final loadingMessage = await showLoadingAsync('과목 정보를 불러오는 중...');
    try {
      final response = await getWithTimeout('$baseUrl/courses/all');
      loadingMessage.complete();

      if (response.statusCode == 200) {
        final courses = json.decode(response.body);
        printCourseTable(courses);
      } else {
        printError('과목 정보를 불러오는데 실패했습니다. (Status: ${response.statusCode})');
      }
    } on TimeoutException {
      loadingMessage.complete();
      printError('요청 시간이 초과되었습니다. 다시 시도해주세요.');
    } catch (e) {
      loadingMessage.complete();
      printError('오류 발생: $e');
    }
  }

  Future<void> searchCourses() async {
    print('\n검색어를 입력하세요: ');
    final keyword = stdin.readLineSync() ?? '';

    final loadingMessage = await showLoadingAsync('검색중...');
    try {
      final response =
          await getWithTimeout('$baseUrl/courses/search?keyword=$keyword');
      loadingMessage.complete();

      if (response.statusCode == 200) {
        final courses = json.decode(response.body);
        printCourseTable(courses);
      } else {
        printError('검색에 실패했습니다.');
      }
    } catch (e) {
      loadingMessage.complete();
      printError('검색 중 오류 발생: $e');
    }
  }

  void printCourseTable(List<dynamic> courses) {
    if (courses.isEmpty) {
      print('등록된 과목이 없습니다.');
      return;
    }

    final headers = ['과목코드', '과목명', '학점', '담당교수'];
    final columnWidths = [10, 30, 6, 15];

    printTableRow(headers, columnWidths, isHeader: true);
    print('━' * (columnWidths.reduce((a, b) => a + b) + headers.length * 3));

    for (var course in courses) {
      final row = [
        course['courseCode'],
        course['courseName'],
        course['credits'].toString(),
        course['professor']
      ];
      printTableRow(
          row.map<String>((e) => e.toString()).toList(), columnWidths);
    }
  }

  void printTableRow(List<String> columns, List<int> widths,
      {bool isHeader = false}) {
    final row = columns.asMap().entries.map((entry) {
      final text = entry.value.padRight(widths[entry.key]);
      return isHeader ? Colorize(text).blue().bold().toString() : text;
    }).join(' │ ');
    print('│ $row │');
  }

  Future<void> managePortfolio() async {
    clearScreen();
    print('\n=== 🎯 포트폴리오 관리 ===\n');

    final options = ['1. 포트폴리오 조회', '2. 새 항목 추가', '3. 돌아가기'];

    options.forEach(print);
    print('\n선택해주세요 (1-3): ');

    final input = stdin.readLineSync();
    await handlePortfolioInput(input);
  }

  Future<void> handlePortfolioInput(String? input) async {
    switch (input) {
      case '1':
        await viewPortfolio();
        break;
      case '2':
        await addPortfolio();
        break;
      case '3':
        return;
      default:
        printError('잘못된 입력입니다.');
    }
    await pressEnterToContinue();
  }

  Future<void> viewPortfolio() async {
    print('사용자의 userId를 입력하세요: ');
    final userId = stdin.readLineSync();

    if (userId == null || userId.isEmpty) {
      printError('userId가 필요합니다.');
      return;
    }

    final loadingMessage = await showLoadingAsync('포트폴리오를 불러오는 중...');
    try {
      final response = await getWithTimeout('$baseUrl/portfolio/user/$userId');
      loadingMessage.complete();

      if (response.statusCode == 200) {
        final portfolios = json.decode(response.body);
        printPortfolioTable(portfolios);
      } else {
        printError('포트폴리오를 불러오는데 실패했습니다.');
      }
    } catch (e) {
      loadingMessage.complete();
      printError('포트폴리오 조회 중 오류 발생: $e');
    }
  }

  void printPortfolioTable(List<dynamic> portfolios) {
    if (portfolios.isEmpty) {
      print('등록된 포트폴리오 항목이 없습니다.');
      return;
    }

    final headers = ['유형', '제목', '날짜', '설명'];
    final columnWidths = [15, 25, 12, 30];

    printTableRow(headers, columnWidths, isHeader: true);
    print('━' * (columnWidths.reduce((a, b) => a + b) + headers.length * 3));

    for (var portfolio in portfolios) {
      final row = [
        portfolio['type'],
        portfolio['title'],
        portfolio['date'],
        portfolio['description'] ?? ''
      ];
      printTableRow(
          row.map<String>((e) => e.toString()).toList(), columnWidths);
    }
  }

  Future<void> addPortfolio() async {
    print('사용자의 userId를 입력하세요: ');
    final userId = stdin.readLineSync();

    if (userId == null || userId.isEmpty) {
      printError('userId가 필요합니다.');
      return;
    }

    print('\n=== 새 포트폴리오 항목 추가 ===\n');
    print('유형 (어학성적/자격증/수상경력/기타): ');
    final type = stdin.readLineSync() ?? '';
    print('제목: ');
    final title = stdin.readLineSync() ?? '';
    print('날짜 (YYYY-MM-DD): ');
    final date = stdin.readLineSync() ?? '';
    print('설명: ');
    final description = stdin.readLineSync() ?? '';

    final data = {
      'userId': userId,
      'type': type,
      'title': title,
      'date': date,
      'description': description
    };

    final loadingMessage = await showLoadingAsync('저장중...');
    try {
      final response = await http
          .post(Uri.parse('$baseUrl/portfolio'),
              headers: {'Content-Type': 'application/json'},
              body: json.encode(data))
          .timeout(Duration(seconds: 10));

      loadingMessage.complete();

      if (response.statusCode == 201) {
        print('\n✅ 포트폴리오가 추가되었습니다.');
      } else {
        printError('포트폴리오 추가에 실패했습니다.');
      }
    } catch (e) {
      loadingMessage.complete();
      printError('저장 중 오류 발생: $e');
    }
  }

  Future<void> analyzeGraduation() async {
    clearScreen();
    print('\n=== 🎓 졸업요건 분석 ===\n');

    final loadingMessage = await showLoadingAsync('졸업요건을 분석중...');
    try {
      final response =
          await getWithTimeout('$baseUrl/graduation-status?userId=test123');
      loadingMessage.complete();

      if (response.statusCode == 200) {
        final status = json.decode(response.body);
        printGraduationStatus(status);
      } else {
        printError('졸업요건 분석에 실패했습니다.');
      }
    } catch (e) {
      loadingMessage.complete();
      printError('분석 중 오류 발생: $e');
    }
  }

  void printGraduationStatus(Map<String, dynamic> status) {
    final categories = [
      {'name': '전체 학점', 'data': status['totalCredits']},
      {'name': '전공 필수', 'data': status['majorCredits']},
      {'name': '교양 필수', 'data': status['generalCredits']}
    ];

    print('\n[졸업요건 현황]\n');

    categories.forEach((category) {
      printProgressBar(
          category['name'] as String,
          category['data']['current'] as int,
          category['data']['required'] as int);
    });

    // 졸업 가능성 분석 추가
    final totalProgress = (status['totalCredits']['current'] /
            status['totalCredits']['required'] *
            100)
        .round();
    print('\n[졸업 진행 상태]');
    final statusMessage = totalProgress >= 100
        ? '졸업요건 충족'
        : totalProgress >= 70
            ? '졸업요건 달성 가능'
            : '추가 이수 필요';
    print(Colorize(statusMessage).apply(totalProgress >= 100
        ? Styles.GREEN
        : totalProgress >= 70
            ? Styles.YELLOW
            : Styles.RED));
  }

  Future<void> manageResumes() async {
    clearScreen();
    print('\n=== 📝 자기소개서 관리 ===\n');

    final options = ['1. 자기소개서 조회', '2. 새 자기소개서 작성', '3. 돌아가기'];

    options.forEach(print);
    print('\n선택해주세요 (1-3): ');

    final input = stdin.readLineSync();
    await handleResumesInput(input);
  }

  Future<void> handleResumesInput(String? input) async {
    switch (input) {
      case '1':
        await viewResumes();
        break;
      case '2':
        await addResume();
        break;
      case '3':
        return;
      default:
        printError('잘못된 입력입니다.');
    }
    await pressEnterToContinue();
  }

  Future<void> viewResumes() async {
    print('사용자의 userId를 입력하세요: ');
    final userId = stdin.readLineSync();

    if (userId == null || userId.isEmpty) {
      printError('userId가 필요합니다.');
      return;
    }

    final loadingMessage = await showLoadingAsync('자기소개서를 불러오는 중...');
    try {
      final response = await getWithTimeout('$baseUrl/resume/user/$userId');
      loadingMessage.complete();

      if (response.statusCode == 200) {
        final resumes = json.decode(response.body);
        printResumeTable(resumes);
      } else {
        printError('자기소개서를 불러오는데 실패했습니다.');
      }
    } catch (e) {
      loadingMessage.complete();
      printError('자기소개서 조회 중 오류 발생: $e');
    }
  }

  void printResumeTable(List<dynamic> resumes) {
    if (resumes.isEmpty) {
      print('등록된 자기소개서 항목이 없습니다.');
      return;
    }

    final headers = ['회사명', '직무', '상태', '소개글'];
    final columnWidths = [15, 20, 10, 30];

    printTableRow(headers, columnWidths, isHeader: true);
    print('━' * (columnWidths.reduce((a, b) => a + b) + headers.length * 3));

    for (var resume in resumes) {
      final row = [
        resume['company']['name'],
        resume['company']['position'],
        resume['status'],
        resume['content']['introduction']
      ];
      printTableRow(
          row.map<String>((e) => e.toString()).toList(), columnWidths);
    }
  }

  Future<void> addResume() async {
    print('사용자의 userId를 입력하세요: ');
    final userId = stdin.readLineSync();

    if (userId == null || userId.isEmpty) {
      printError('userId가 필요합니다.');
      return;
    }

    print('\n=== 새 자기소개서 작성 ===\n');
    print('회사명: ');
    final company = stdin.readLineSync() ?? '';
    print('직무: ');
    final position = stdin.readLineSync() ?? '';
    print('직무 형태 (정규직/인턴): ');
    final jobType = stdin.readLineSync() ?? '';
    print('자기소개: ');
    final introduction = stdin.readLineSync() ?? '';
    print('지원동기: ');
    final motivation = stdin.readLineSync() ?? '';
    print('강점: ');
    final strength = stdin.readLineSync() ?? '';
    print('향후 목표: ');
    final futureGoals = stdin.readLineSync() ?? '';

    final data = {
      'userId': userId,
      'company': {'name': company, 'position': position, 'jobType': jobType},
      'content': {
        'introduction': introduction,
        'motivation': motivation,
        'strength': strength,
        'futureGoals': futureGoals
      },
      'status': '작성중'
    };

    final loadingMessage = await showLoadingAsync('자기소개서 저장 중...');
    try {
      final response = await http
          .post(Uri.parse('$baseUrl/resume'),
              headers: {'Content-Type': 'application/json'},
              body: json.encode(data))
          .timeout(Duration(seconds: 10));

      loadingMessage.complete();

      if (response.statusCode == 201) {
        print('\n✅ 자기소개서가 성공적으로 저장되었습니다.');
      } else {
        printError('자기소개서 저장에 실패했습니다.');
      }
    } catch (e) {
      loadingMessage.complete();
      printError('저장 중 오류 발생: $e');
    }
  }

  void printProgressBar(String label, int current, int total) {
    final width = 30;
    final progress = (current / total * width).round();
    final bar = '█' * progress + '░' * (width - progress);
    final percentage = (current / total * 100).round();

    final text = '$label: $bar $percentage% ($current/$total)';
    print(Colorize(text).apply(percentage >= 100
        ? Styles.GREEN
        : percentage >= 70
            ? Styles.YELLOW
            : Styles.RED));
  }

  void printError(String message) {
    print(Colorize('❌ $message').red().bold());
  }

  Future<void> pressEnterToContinue() async {
    print('\n계속하려면 Enter를 누르세요...');
    stdin.readLineSync();
  }

  Future<Completer<void>> showLoadingAsync(String message) {
    final completer = Completer<void>();
    var i = 0;
    final frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

    Timer.periodic(Duration(milliseconds: 80), (timer) {
      if (completer.isCompleted) {
        timer.cancel();
        stdout.write('\r' + ' ' * (message.length + 2) + '\r');
        return;
      }

      stdout.write('\r${frames[i]} $message');
      i = (i + 1) % frames.length;
    });

    return Future.value(completer);
  }
}
