// bin/uniment_cli.dart
import 'dart:io';
import 'package:colorize/colorize.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main(List<String> arguments) async {
  UnimentCLI cli = UnimentCLI();
  await cli.start();
}

class UnimentCLI {
  final String baseUrl = 'http://uniment.site:5555/api';

  Future<void> start() async {
    while (true) {
      printMenu();
      String? choice = stdin.readLineSync();

      switch (choice) {
        case '1':
          await showCourses();
          break;
        case '2':
          await showGraduationStatus();
          break;
        case '3':
          await showPortfolio();
          break;
        case '4':
          await searchCourses();
          break;
        case '5':
          print('프로그램을 종료합니다.');
          exit(0);
        default:
          print('잘못된 선택입니다.');
      }
    }
  }

  void printMenu() {
    print('\n===== Uniment CLI Demo =====');
    var title = Colorize('Uniment 학사 관리 시스템');
    title.blue().bold();
    print(title);
    print('1. 전체 과목 조회');
    print('2. 졸업요건 현황');
    print('3. 포트폴리오 조회');
    print('4. 과목 검색');
    print('5. 종료');
    print('선택하세요: ');
  }

  Future<void> showCourses() async {
    print('\n[전체 과목 목록]');
    try {
      var response = await http.get(Uri.parse('$baseUrl/courses/all'));
      if (response.statusCode == 200) {
        var courses = json.decode(response.body);
        for (var course in courses) {
          var courseInfo = Colorize(
              '${course['courseCode']} - ${course['courseName']} (${course['credits']}학점)');
          courseInfo.green();
          print(courseInfo);
        }
      } else {
        throw Exception('Failed to load courses');
      }
    } catch (e) {
      var error = Colorize('Error: $e');
      error.red();
      print(error);
    }
  }

  Future<void> showGraduationStatus() async {
    print('\n[졸업요건 현황]');
    try {
      var response = await http
          .get(Uri.parse('$baseUrl/graduation-status?userId=test123'));
      if (response.statusCode == 200) {
        var status = json.decode(response.body);
        var total = Colorize(
            '총 이수학점: ${status['totalCredits']['current']}/${status['totalCredits']['required']}');
        total.blue().bold();
        print(total);
      }
    } catch (e) {
      var error = Colorize('Error: $e');
      error.red();
      print(error);
    }
  }

  Future<void> showPortfolio() async {
    print('\n[포트폴리오 현황]');
    try {
      var response =
          await http.get(Uri.parse('$baseUrl/portfolio/user/test123'));
      if (response.statusCode == 200) {
        var portfolios = json.decode(response.body);
        for (var item in portfolios) {
          var portfolio =
              Colorize('${item['type']} - ${item['title']} (${item['date']})');
          portfolio.yellow();
          print(portfolio);
        }
      }
    } catch (e) {
      var error = Colorize('Error: $e');
      error.red();
      print(error);
    }
  }

  Future<void> searchCourses() async {
    print('\n과목 검색어를 입력하세요: ');
    String? keyword = stdin.readLineSync();
    try {
      var response =
          await http.get(Uri.parse('$baseUrl/courses/search?keyword=$keyword'));
      if (response.statusCode == 200) {
        var courses = json.decode(response.body);
        for (var course in courses) {
          var courseInfo =
              Colorize('${course['courseCode']} - ${course['courseName']}');
          courseInfo.green();
          print(courseInfo);
        }
      }
    } catch (e) {
      var error = Colorize('Error: $e');
      error.red();
      print(error);
    }
  }
}
