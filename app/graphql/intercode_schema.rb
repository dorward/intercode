class IntercodeSchema < GraphQL::Schema
  class NotAuthorizedError < GraphQL::ExecutionError
    attr_reader :current_user

    def self.from_error(error, message, **args)
      new(message, current_user: error.context[:current_user], **args)
    end

    def initialize(message, current_user:, **args)
      super(message, **args)
      @current_user = current_user
    end

    def message
      if current_user
        super
      else
        'Not logged in'
      end
    end

    def code
      if current_user
        'NOT_AUTHORIZED'
      else
        'NOT_AUTHENTICATED'
      end
    end

    def to_h
      super.merge({
        "extensions" => {
          "code" => code,
          "current_user_id": current_user&.id
        }
      })
    end
  end

  mutation(Types::MutationType)
  query(Types::QueryType)

  use GraphQL::Batch
  use GraphQL::Tracing::SkylightTracing, set_endpoint_name: true

  better_rescue_middleware = BetterRescueMiddleware.new
  better_rescue_middleware.rescue_from ActiveRecord::RecordInvalid do |err, _ctx|
    GraphQL::ExecutionError.new(
      "Validation failed for #{err.record.class.name}: \
#{err.record.errors.full_messages.join(', ')}",
      options: {
        validationErrors: err.record.errors.as_json
      }
    )
  end
  better_rescue_middleware.rescue_from CivilService::ServiceFailure do |err, _ctx|
    err.result.errors.full_messages.join(', ')
  end
  better_rescue_middleware.suppress_logs(
    ActiveRecord::RecordNotFound,
    ActiveRecord::RecordInvalid,
    Liquid::SyntaxError,
    NotAuthorizedError
  )
  middleware better_rescue_middleware

  def self.resolve_type(_abstract_type, object, _context)
    case object
    when MailingListsPresenter then Types::MailingListsType
    end
  end

  def self.object_from_id(node_id, ctx)
  end

  def self.id_from_object(object, type, ctx)
  end

  def self.unauthorized_object(error)
    # Add a top-level error to the response instead of returning nil:
    raise NotAuthorizedError.from_error(
      error,
      "An object of type #{error.type.graphql_name} was hidden due to permissions"
    )
  end

  def self.unauthorized_field(error)
    # It should be safe to query for admin_notes even if you can't see them
    return nil if error.field.graphql_name == 'admin_notes'

    # Add a top-level error to the response instead of returning nil:
    raise NotAuthorizedError.from_error(
      error,
      "The field #{error.field.graphql_name} on an object of type #{error.type.graphql_name} \
was hidden due to permissions"
    )
  end
end
