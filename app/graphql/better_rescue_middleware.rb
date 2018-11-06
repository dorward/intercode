class BetterRescueMiddleware
  class UnloggedError < StandardError; end

  attr_reader :rescue_table, :unlogged_error_classes

  def initialize
    @rescue_table = []
    @unlogged_error_classes = [UnloggedError]
  end

  def rescue_from(*error_classes, &block)
    base_classes = Set.new(rescue_table.map(&:first))
    error_classes.map do |error_class|
      next if base_classes.include?(error_class)
      rescue_table << [error_class, block]
    end
  end

  def suppress_logs(*error_classes)
    @unlogged_error_classes.concat(error_classes)
  end

  def remove_handler(*error_classes)
    remove_classes = Set.new(error_classes)
    rescue_table.reject! { |error_class| remove_classes.include?(error_class) }
  end

  def call(*)
    yield
  rescue StandardError => err
    unless unlogged_error_classes.any? { |klass| err.is_a?(klass) }
      Rails.logger.error Rails.backtrace_cleaner.clean(err.backtrace).reverse.join("\n")
      Rails.logger.error "#{err.class.name} processing GraphQL query: #{err.message}"
      Rollbar.error(err)
    end
    attempt_rescue(err)
  end

  private

  def attempt_rescue(err)
    handler = find_handler(err)
    return GraphQL::ExecutionError.new(err.message) unless handler

    return_error = handler.call(err)
    if return_error.is_a?(String)
      GraphQL::ExecutionError.new(return_error)
    else
      return_error
    end
  end

  def find_handler(err)
    table_entry = rescue_table.find { |(base_class, _)| err.is_a?(base_class) }
    table_entry&.second
  end
end
