module Concerns::SendCsv
  def configure_csv_headers(csv_filename)
    headers['X-Accel-Buffering'] = 'no'
    headers['Cache-Control'] = 'no-cache'
    headers['Content-Type'] = 'text/csv; charset=utf-8'
    headers['Content-Disposition'] = %(attachment; filename="#{csv_filename}")
    headers['Last-Modified'] = Time.zone.now.ctime.to_s
  end

  def send_table_presenter_csv(table_presenter, basename)
    filter_descriptions = table_presenter.filter_descriptions
    name_suffix = if filter_descriptions.any?
      " (#{filter_descriptions.map { |desc| desc.gsub(':', ' -') }.join(', ')})"
    else
      ''
    end

    configure_csv_headers("#{basename}#{name_suffix}.csv")
    self.response_body = table_presenter.csv_enumerator
  end
end