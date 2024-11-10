import 'package:http/http.dart' as http;
import 'dart:async';

class ApiService {
  static const String baseUrl = 'http://43.201.76.22:5555/api';
  static final http.Client _client = http.Client();

  static Future<http.Response> getWithTimeout(String endpoint) {
    final url = '$baseUrl$endpoint';
    return _client.get(Uri.parse(url)).timeout(
      const Duration(seconds: 10),
      onTimeout: () {
        throw TimeoutException('요청 시간이 초과되었습니다.');
      },
    );
  }
}
