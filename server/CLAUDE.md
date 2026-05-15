# Backend Code & Review Conventions

Generic conventions for a TypeScript backend. Applies to both **Express** and **NestJS** style codebases — routes, controllers, services, DTOs, repositories, middleware, utilities, migrations, and tests.

Where a rule is framework-specific, both flavors are shown side-by-side.

---

## TypeScript

**ALWAYS:**
- Use explicit types instead of `any`. Use `unknown` if the type is truly unknown.
- Prefer `interface` for object shapes, `type` for unions/intersections.
- Use `readonly` for immutable properties.
- Use proper null/undefined checks before accessing properties.

**NEVER:**
- Use `any` — including inside callbacks (e.g. `(acc, item: any) => ...` in `reduce`/`map`/`forEach`). Type the element and accumulator explicitly.
- Leave unused imports or variables.
- Use `as` assertions without runtime validation.
- Suppress TS errors with `@ts-ignore` / `@ts-expect-error` without justification — fix the root cause.

---

## Code Organization

**File Structure:**
- One class/interface per file (related DTOs may share a file).
- Group related exports in `index.ts` (only at module boundaries — not as a deep barrel).
- Keep files focused; aim for under ~300 lines.

**Express layout (recommended):**
```
src/
  routes/           # express Router definitions, thin
  controllers/      # request handlers — parse input, call service, send response
  services/         # business logic
  repositories/     # all DB access
  middlewares/      # auth, validation, error handling, logging
  dtos/             # request/response shapes + validators
  utils/
  config/
  app.ts            # express app wiring
  server.ts         # http listener bootstrap
```

**NestJS layout:**
```
src/
  modules/<feature>/
    <feature>.controller.ts
    <feature>.service.ts
    <feature>.module.ts
    <feature>.repository.ts
    dto/
```

**Imports:**
- Use absolute imports from `src/` root (configure `tsconfig` `paths`).
- Group imports: external → internal → relative.
- Remove unused imports.

**Naming Conventions:**
- Classes: PascalCase (`UserService`).
- Methods/variables: camelCase (`getUserById`).
- Constants: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`).
- Interfaces: PascalCase, often with `I` prefix or descriptive suffix.
- Files: kebab-case for utilities; match the class name for class files.

---

## Functions

**ALWAYS:**
- Keep functions small and focused — one thing per function.
- Limit arguments to ≤3; use an options object or DTO beyond that.
- Maintain one level of abstraction per function — don't mix high-level orchestration with low-level details.
- Prefer early returns / guard clauses over deep nesting.
- A function should either **command** (mutate state) or **query** (return data), not both.

**NEVER:**
- Use boolean flag arguments that make a function do two different things — split into two functions.
- Nest logic deeper than 3 levels — extract helpers.
- Write functions longer than ~50 lines.

**Example — guard clauses:**
```typescript
// Bad: deep nesting
async function getResourceForUser(ctx: SessionContext, resourceId: number): Promise<ResourceDto> {
  const resource = await resourceRepository.findById(resourceId);
  if (resource) {
    if (resource.ownerId === ctx.userId) {
      const detail = await detailRepository.findByResourceId(resourceId);
      if (detail) {
        return mapToDto(detail);
      } else {
        throw new NotFoundError("Detail not found");
      }
    } else {
      throw new ForbiddenError("Access denied");
    }
  } else {
    throw new NotFoundError("Resource not found");
  }
}

// Good: guard clauses with early returns
async function getResourceForUser(ctx: SessionContext, resourceId: number): Promise<ResourceDto> {
  const resource = await resourceRepository.findById(resourceId);
  if (!resource) throw new NotFoundError("Resource not found");
  if (resource.ownerId !== ctx.userId) throw new ForbiddenError("Access denied");

  const detail = await detailRepository.findByResourceId(resourceId);
  if (!detail) throw new NotFoundError("Detail not found");

  return mapToDto(detail);
}
```

---

## Naming

**ALWAYS:**
- Names reveal intent — `daysSinceLastLogin` not `days`, `activeUserCount` not `count`.
- Booleans use `is`/`has`/`should`/`can` — `isActive` not `active` or `activeFlag`.
- Methods describe **what** they do, not **how** — `ensureUserHasAccess` over `checkAndThrow`.

**NEVER:**
- Use abbreviations unless universally understood (`ctx`, `dto`, `id` are fine; `scc`, `tmpRes` are not).
- Encode types in names — `users` not `userArray`, `name` not `nameString`.

---

## Encapsulate Conditionals & Enum Logic

**ALWAYS:**
- Encapsulate `[Enum.A, Enum.B].includes(value)` as a static method on the enum's util class — defined once, reused everywhere.
- Name the method after the **semantic concept**, not the enum members — so adding a new value only changes the method body, not its name or callers.
- Extract complex boolean expressions into well-named functions.

**NEVER:**
- Scatter inline `.includes([...])` enum checks across services/controllers.

**Example:**
```typescript
// Bad: scattered and fragile
if ([ComponentEnum.BASIC, ComponentEnum.HRA].includes(section)) { ... }

// Good: encapsulated with a semantic name
export class ComponentUtil {
  static isEarning(section: ComponentEnum): boolean {
    return [ComponentEnum.BASIC, ComponentEnum.HRA].includes(section);
  }
}

if (ComponentUtil.isEarning(section)) { ... }

// Bad: name lists enum members (breaks when adding new ones)
static isBasicOrHra(section) { ... }

// Good: name describes the concept
static isEarning(section) { ... }
```

---

## Maps & Lookups

**ALWAYS:**
- Use a `toHashMap` / `toHashMapArrays` utility for lookup maps (don't hand-roll).
- Name map variables as `keyToValueMap` — e.g., `idToUserMap`, `userIdToOrdersMap`, `orgIdToConfigMap`.
- The key part names the field used as the key; the value part names what's stored.

**NEVER:**
- Hand-roll `reduce`/`forEach` to build `Record<>` / `Map<>` lookups.
- Use vague names like `userMap` or `dataMap` — always specify the key.

**Example:**
```typescript
// Bad
const userMap = users.reduce((acc, user) => {
  acc[user.id] = user;
  return acc;
}, {});

// Good
const idToUserMap = toHashMap(users, "id");
```

---

## Dates & Timezones

**ALWAYS:**
- Be timezone-aware — never assume UTC or server-local time.
- Use a project-wide timezone-aware date utility (e.g., a wrapper around Luxon / date-fns-tz) for all formatting, parsing, comparisons, and ranges.
- Account for business/tenant timezone when storing or comparing dates.

**NEVER:**
- Use raw `new Date()`, `moment()`, or `Date.now()` for business-logic dates — these are timezone-unaware.
- Format dates with string manipulation — use the date utility's formatting methods.

---

## DRY (Don't Repeat Yourself)

**ALWAYS:**
- Extract genuinely duplicated logic (same intent, not just same shape) into shared utilities.

**NEVER:**
- Over-abstract — three similar lines are better than a premature abstraction.
- Duplicate the same validation, transformation, or business rule in multiple places.

---

## Comments

**ALWAYS:**
- Comments explain **why**, not **what** — the code shows what.
- Use JSDoc for public API boundaries and non-obvious business logic.

**NEVER:**
- Comment bad code — rewrite it.
- Leave commented-out code — git has history.
- Restate the code in noise comments (`// increment counter` above `counter++`).

---

## Side Effects

**ALWAYS:**
- Make mutations explicit in the function name — `updateX`, `deleteX`, `markAsX`.
- Return new values instead of modifying inputs.

**NEVER:**
- Mutate state in a query-named function (`getX`/`findX` must not modify data).
- Modify input parameters silently.

---

## Magic Numbers & Strings

**ALWAYS:**
- Extract magic numbers into named constants — `const MAX_RETRY_ATTEMPTS = 3`.
- Use enums for string literals that represent a fixed set of values.

**NEVER:**
- Leave unexplained numeric literals in business logic.
- Exception: `0`, `1`, `-1`, empty string, and `null` checks are self-explanatory.

---

## Class & Module Design (Services)

**ALWAYS:**
- Single Responsibility — a service has one reason to change.
- Keep related logic together; don't scatter a feature across many services.
- Express: export a service as a class (instantiated at composition root) or a module of pure functions — pick one pattern per project and stick to it.
- NestJS: use `@Injectable()` and constructor DI.

**Watch for:**
- A constructor (or import list) with >8 dependencies signals too many responsibilities — split.

---

## HTTP Layer (Routes / Controllers)

The HTTP layer's job is to **parse input, delegate to a service, shape the response**. No business logic.

**ALWAYS:**
- Authenticate before authorizing; reject early with the right status code.
- Validate every input — body, query, params, headers — at the boundary using a schema (zod / class-validator / joi). Never trust raw `req.body`.
- Return DTOs, not raw DB entities.
- Send a stable response shape (e.g. `{ data, error, meta }`) — pick one and use it project-wide.
- Use the right HTTP status: `200/201`, `204`, `400`, `401`, `403`, `404`, `409`, `422`, `500`.

**NEVER:**
- Put business logic in controllers / route handlers.
- Skip authentication/authorization on protected endpoints.
- Return raw DB entities — always map to DTOs.
- Use `any` on `req` / `res` — type them (`AuthenticatedRequest`, etc.).

### Express — route + controller

```typescript
// routes/resource.routes.ts — thin wiring only
import { Router } from "express";
import { requireAuth } from "@/middlewares/require-auth";
import { validateBody } from "@/middlewares/validate";
import { createResourceSchema } from "@/dtos/resource.dto";
import { resourceController } from "@/controllers/resource.controller";

export const resourceRouter = Router();

resourceRouter.post(
  "/",
  requireAuth,
  validateBody(createResourceSchema),
  resourceController.create,
);
```

```typescript
// controllers/resource.controller.ts — thin: parse → service → respond
import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "@/types/http";
import { resourceService } from "@/services/resource.service";

export const resourceController = {
  create: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const dto = await resourceService.createResource(req.ctx, req.body);
      res.status(201).json({ data: dto });
    } catch (err) {
      next(err); // delegate to centralized error middleware
    }
  },
};
```

**Async errors:** every async handler must either `try/catch + next(err)` or be wrapped by an `asyncHandler` helper. Unhandled rejections in Express are silent.

### NestJS — controller

```typescript
@ApiTags("resource-name")
@Controller("resource-name")
@UseGuards(UserAuthGuard)
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @ApiOkResponse({ type: ResponseDto })
  @UserAuthz({ roles: [UserRoleEnum.ADMIN] })
  @Get()
  public async getResource(@Req() req: AuthenticatedRequest): Promise<ResponseDto> {
    return this.resourceService.getResource(req.loaded);
  }
}
```

---

## Services

**ALWAYS:**
- Use async/await; let errors bubble unless you can meaningfully recover.
- Wrap multi-step DB writes in a transaction.
- Use `ctx: SessionContext` (or your project's session/auth context) as the **first parameter** when context is needed.
- Return DTOs, not ORM entities.

**Express service (class form):**
```typescript
export class ResourceService {
  constructor(
    private readonly resourceRepository: ResourceRepository,
    private readonly otherService: OtherService,
  ) {}

  async createResource(ctx: SessionContext, data: CreateResourceDto): Promise<ResourceDto> {
    // validation → business logic → persistence → return DTO
  }
}

export const resourceService = new ResourceService(resourceRepository, otherService);
```

**NestJS service:**
```typescript
@Injectable()
export class ResourceService {
  constructor(
    private readonly resourceRepository: ResourceRepository,
    private readonly otherService: OtherService,
  ) {}

  public async createResource(ctx: SessionContext, data: CreateResourceDto): Promise<ResourceDto> {
    // ...
  }
}
```

**NEVER:**
- Access database models directly (use repositories).
- Mix HTTP concerns (`req`/`res`/status codes) with business logic.
- Create circular dependencies between services.
- Place `ctx: SessionContext` anywhere but first.

---

## Middleware (Express) / Guards & Pipes (NestJS)

Cross-cutting concerns — auth, validation, request logging, error handling, rate limiting — belong in middleware/guards. Not in route handlers.

**Auth middleware (Express):**
```typescript
export const requireAuth: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer /, "");
  if (!token) return next(new UnauthorizedError("Missing token"));
  // verify, attach to req.ctx, call next()
};
```

**Validation middleware (Express, with zod):**
```typescript
export const validateBody =
  <T extends ZodSchema>(schema: T): RequestHandler =>
  (req, _res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return next(new BadRequestError(parsed.error.message));
    req.body = parsed.data;
    next();
  };
```

**Centralized error middleware (Express) — register LAST:**
```typescript
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err.status ?? 500;
  logger.error({ err }, "request failed");
  res.status(status).json({
    error: { code: err.code ?? "INTERNAL_ERROR", message: err.expose ? err.message : "Unexpected error" },
  });
};
```

---

## DTOs and Validation

### Request DTOs

**ALWAYS:**
- Validate at the boundary with a schema library — `class-validator` (NestJS) or `zod`/`joi`/`yup` (Express).
- Document with `@ApiProperty()` (NestJS Swagger) or generate OpenAPI from zod (`zod-to-openapi`).
- Reject extra/unknown fields by default.

**NestJS (class-validator):**
```typescript
export class CreateResourceDto {
  @ApiProperty({ description: "Resource name" })
  @IsNotEmpty()
  @IsString()
  public name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  public email?: string;
}
```

**Express (zod):**
```typescript
export const createResourceSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email().optional(),
  })
  .strict();

export type CreateResourceDto = z.infer<typeof createResourceSchema>;
```

### Response DTOs

**ALWAYS:**
- Separate response DTOs from request DTOs.
- Exclude sensitive data (passwords, tokens, internal IDs you don't expose).
- Use a consistent response wrapper if your codebase has one (e.g. `{ data: T }`).

**NEVER:**
- Return DB entities directly.
- Leak sensitive fields into responses.

---

## Database & Repositories

**ALWAYS:**
- All DB access goes through repositories — services never touch ORM models / query builders directly.
- Give repository methods an explicit return type (e.g. `Promise<Entity[]>`, `Promise<{ count: number; rows: Entity[] }>`). Never `Promise<any>`.
- Use the ORM's query builder (Sequelize / TypeORM / Prisma / Drizzle / Knex) — not raw SQL — for type safety and injection prevention.
- Use transactions for any multi-table write.
- Handle null/undefined results explicitly.
- Use proper `where` filters and pagination for large datasets.

**Transactions — generic shape:**
```typescript
// Knex / Prisma / Sequelize all expose this pattern
await db.transaction(async (trx) => {
  await resource1Repository.update(trx, ...);
  await resource2Repository.update(trx, ...);
});
```

**NestJS sugar:**
```typescript
@SequelizeTransactional()
public async updateMultipleResources(): Promise<void> {
  await this.resource1Repository.update(...);
  await this.resource2Repository.update(...);
}
```

**NEVER:**
- Access ORM models directly in services or controllers.
- Skip transactions when a write spans multiple tables.
- Use raw SQL without strong justification.
- Use `onUpdate` / `onDelete` foreign-key constraints alongside ORM transactions — they can interact badly with rollbacks and referential integrity.

### Query Optimization

**ALWAYS:**
- Use targeted `where` clauses; paginate large result sets; use `select` to limit columns when appropriate; index frequently queried fields.

**NEVER:**
- Load whole tables into memory.
- Write N+1 query patterns — preload relations or batch with `IN` queries.
- Skip pagination for endpoints that can return large lists.

---

## Security

### Authentication & Authorization

**ALWAYS:**
- Guard protected endpoints (Express middleware / NestJS guards).
- Apply role/permission checks at the route boundary.
- Take user/tenant identity from the authenticated request (`req.ctx`) — never from the client body.
- Check tenant/business scope (e.g. resource belongs to the caller's organization).

**NEVER:**
- Trust client-provided IDs without server-side validation.
- Skip authorization checks.
- Leak sensitive information in error messages.

### Data Validation

**ALWAYS:**
- Validate **all** user input — body, query, params, headers, file uploads.
- Rely on parameterized queries via the ORM.
- Validate file uploads (type, size, content).
- Set sensible body/parser size limits (`express.json({ limit: "1mb" })`).
- Apply `helmet`, CORS allowlist, and rate limiting at the app level.

**NEVER:**
- Concatenate user input into queries.
- Accept files without size/type validation.
- Echo user input verbatim into logs without scrubbing secrets.

---

## Error Handling

**ALWAYS:**
- Use a typed error hierarchy with HTTP semantics:
  - **NestJS:** built-in (`BadRequestException`, `NotFoundException`, `ForbiddenException`, `ConflictException`, …).
  - **Express:** define your own (`AppError` base → `BadRequestError`, `NotFoundError`, `ForbiddenError`, `ConflictError`, …) with `status` and `code` fields.
- Use centralized error codes (e.g. a `PBErrorCodes`-style enum) when available.
- Log errors with context (request id, user id, route).
- Let unexpected errors bubble to the global exception filter (NestJS) / error middleware (Express).

**Example:**
```typescript
if (!resource) {
  throw new NotFoundError(toErrorMessage(ErrorCodes.RESOURCE_NOT_FOUND));
}
```

**Express async-handler pattern:**
```typescript
export const asyncHandler =
  <T extends RequestHandler>(fn: T): RequestHandler =>
  (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
```

**NEVER:**
- Swallow errors silently.
- Return generic, context-free error messages.
- Expose stack traces to clients in production.
- Catch errors only to re-throw them unchanged.
- Forget to register the error middleware **last** in Express (after all routes).

### In Transactions

- Let errors bubble in transactional methods so the transaction rolls back.
- Only catch errors inside a transaction if you can meaningfully recover and decide whether to continue or abort.

---

## Logging & Observability

**ALWAYS:**
- Use a structured logger (`pino`, `winston`, NestJS `Logger`) — not `console.log`.
- Include request id / trace id on every log line in a request scope.
- Log at the right level: `debug` (verbose dev), `info` (lifecycle), `warn` (recoverable), `error` (failed).
- Scrub secrets, tokens, PII before logging.

**NEVER:**
- `console.log` in production code.
- Log full request bodies without scrubbing.

---

## Configuration

**ALWAYS:**
- Read all config from environment variables, parsed and validated at boot (zod / `@nestjs/config` + `Joi`).
- Fail fast on missing/invalid config — don't lazily read `process.env` deep in the call stack.
- Type the config object once and inject/import it everywhere else.

**NEVER:**
- Sprinkle `process.env.X` reads across services.
- Commit secrets — use `.env`, `.env.example`, and a secret manager.

---

## Performance

**ALWAYS:**
- Paginate list endpoints.
- Batch DB operations where possible.
- Cache frequently accessed, rarely changing data.
- Avoid DB queries inside loops — batch with `IN` queries or precomputed maps.

**NEVER:**
- Load entire datasets when a subset is enough.
- Block the event loop with synchronous CPU-heavy work in request handlers — offload to workers / queues.
- Leak resources (unclosed connections, dangling event listeners, uncleared timers).

---

## Testing

**ALWAYS:**
- Unit test complex business logic.
- Cover error and edge cases.
- Mock external dependencies cleanly (no `as any` on mocks — type them properly).
- Use descriptive test names.
- Express: integration-test routes with `supertest` against a real app instance with a test DB.

**Consider:**
- Integration tests for critical flows.
- E2E tests for important user journeys.

---

## Documentation

**ALWAYS:**
- JSDoc on public methods and non-obvious business logic.
- Document API contracts:
  - **NestJS:** Swagger via `@ApiProperty`, `@ApiOkResponse`, `@ApiQuery`.
  - **Express:** OpenAPI generated from zod (`zod-to-openapi`) or hand-written `swagger.yaml` kept in sync.
- Update READMEs for new modules/features.

**Example:**
```typescript
/**
 * Creates a new resource with the provided data.
 * Validates business rules and applies default values.
 *
 * @param ctx - Session context with user information
 * @param data - Resource creation data
 * @returns Created resource DTO
 * @throws BadRequestError if validation fails
 */
public async createResource(ctx: SessionContext, data: CreateResourceDto): Promise<ResourceDto> {
  // ...
}
```

---

## Code Review Checklist

### Functionality
- [ ] Works as intended.
- [ ] Edge cases handled.
- [ ] Errors handled appropriately.
- [ ] No unintended breaking changes (or documented if intentional).

### Code Quality
- [ ] No TypeScript errors/warnings.
- [ ] `npm run lint` passes.
- [ ] Follows existing patterns.
- [ ] No unused imports/variables/dead code.
- [ ] Proper error handling throughout.

### Security
- [ ] AuthN/AuthZ in place.
- [ ] All user inputs validated (body, query, params, headers, files).
- [ ] No sensitive data in responses or logs.
- [ ] Parameterized queries everywhere.
- [ ] `helmet`, CORS, rate limit configured (Express).

### Database
- [ ] Transactions for multi-step writes.
- [ ] Repositories used (no direct model access).
- [ ] Pagination on list endpoints.
- [ ] No N+1 patterns.

### HTTP Layer
- [ ] Controllers / route handlers are thin — no business logic.
- [ ] DTOs returned, not ORM entities.
- [ ] Async handlers wrapped with `asyncHandler` or `try/catch + next(err)` (Express).
- [ ] Error middleware registered last (Express).
- [ ] Decorators applied correctly (NestJS).

### Documentation
- [ ] Swagger / OpenAPI updated.
- [ ] Non-obvious logic commented (why, not what).
- [ ] Public methods have JSDoc.

### Testing
- [ ] New functionality covered.
- [ ] Existing tests still pass.

---

## Code Smells & Red Flags

Flag during review:

- `any` types without justification (including callbacks: `reduce`/`map`/`forEach`).
- Missing authentication or authorization.
- Direct ORM model access in services.
- Missing error handling — async route handlers without `try/catch` or `asyncHandler`.
- No input validation — including query params (use a query DTO + validation, not raw `req.query.x` + manual parsing).
- New endpoints without API docs (Swagger/OpenAPI).
- Repository methods returning `Promise<any>` — require explicit return types.
- Hardcoded values that should be configurable.
- Missing transactions for multi-step writes.
- `onUpdate` / `onDelete` FK constraints inside ORM transactions.
- `SessionContext` not as the first parameter.
- Functions >50 lines.
- Functions with >4 non-DTO parameters.
- Deep nesting (>3 levels).
- Boolean flag arguments that split function behavior.
- Inline `[Enum.X, Enum.Y].includes()` instead of an enum-level method.
- Magic numbers/strings without named constants.
- Hand-rolled `reduce`/`forEach` lookups instead of `toHashMap`/`toHashMapArrays`.
- Map variables not following the `keyToValueMap` naming.
- Raw `new Date()` / `moment()` for business-logic dates.
- Raw SQL queries in repositories.
- Deep property access chains (`a.b.c.d.e`) — Law of Demeter violation.
- Catch blocks that swallow errors silently.
- Nested callbacks or promise chains (use async/await).
- `console.log` left in code (use the project logger).
- `process.env.X` read deep in the call stack instead of injected config.
- Commented-out code blocks.
- Unused code or dead branches.
- Express: error middleware not registered last, or missing entirely.
- Express: business logic inside route handlers instead of services.
