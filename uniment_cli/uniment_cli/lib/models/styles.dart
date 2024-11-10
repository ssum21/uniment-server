enum Styles { GREEN, YELLOW, RED }

extension StylesExtension on Styles {
  String get value {
    switch (this) {
      case Styles.GREEN:
        return 'green';
      case Styles.YELLOW:
        return 'yellow';
      case Styles.RED:
        return 'red';
      default:
        return '';
    }
  }
}
